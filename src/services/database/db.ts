import * as SQLite from 'expo-sqlite';
import type { DailyTotals, FoodAnalysis, Meal, UserProfile, WatchAnalysis } from '@/types';
import { localDateKey, uid } from '@/utils/date';
let database: Promise<SQLite.SQLiteDatabase> | null = null;
export async function getDb() {
  if (!database) database = (async()=>{
    const db=await SQLite.openDatabaseAsync('calorievue.db');
    await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS profiles (id TEXT PRIMARY KEY NOT NULL, payload TEXT NOT NULL, updated_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS meals (id TEXT PRIMARY KEY NOT NULL, date TEXT NOT NULL, meal_type TEXT NOT NULL, calories REAL NOT NULL, protein REAL NOT NULL, carbs REAL NOT NULL, fat REAL NOT NULL, description TEXT NOT NULL, image_uri TEXT, thumbnail_uri TEXT, created_at TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS meals_date_idx ON meals(date);
      CREATE TABLE IF NOT EXISTS daily_totals (date TEXT PRIMARY KEY NOT NULL, calories REAL NOT NULL DEFAULT 0, protein REAL NOT NULL DEFAULT 0, carbs REAL NOT NULL DEFAULT 0, fat REAL NOT NULL DEFAULT 0, exercise REAL NOT NULL DEFAULT 0, stand REAL NOT NULL DEFAULT 0, updated_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS scan_usage (id TEXT PRIMARY KEY NOT NULL, local_date TEXT NOT NULL, scan_type TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS scan_usage_date_idx ON scan_usage(local_date,status);
      CREATE TABLE IF NOT EXISTS watch_analyses (id TEXT PRIMARY KEY NOT NULL, date TEXT NOT NULL, calories REAL NOT NULL, exercise REAL NOT NULL, stand REAL NOT NULL, created_at TEXT NOT NULL);
      PRAGMA user_version = 1;
    `);
    const cutoff = new Date(Date.now()-60*60*1000).toISOString();
    await db.runAsync("UPDATE scan_usage SET status='released' WHERE status='reserved' AND created_at<?", cutoff);
    return db;
  })();
  return database;
}
export async function saveProfile(profile: UserProfile) { const db=await getDb(); await db.runAsync('INSERT INTO profiles(id,payload,updated_at) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at',profile.id,JSON.stringify(profile),new Date().toISOString()); }
export async function getProfile(): Promise<UserProfile|null> { const db=await getDb(); const row=await db.getFirstAsync<{payload:string}>('SELECT payload FROM profiles WHERE id=?','local'); return row?JSON.parse(row.payload):null; }
export async function getMeals(date=localDateKey()): Promise<Meal[]> { const db=await getDb(); return db.getAllAsync<Meal>('SELECT * FROM meals WHERE date=? ORDER BY created_at DESC',date); }
export async function getRecentMeals(limit=50): Promise<Meal[]> { const db=await getDb(); return db.getAllAsync<Meal>('SELECT * FROM meals ORDER BY created_at DESC LIMIT ?',limit); }
export async function getTotals(date=localDateKey()): Promise<DailyTotals> { const db=await getDb(); const row=await db.getFirstAsync<DailyTotals>('SELECT * FROM daily_totals WHERE date=?',date); return row??{date,calories:0,protein:0,carbs:0,fat:0,exercise:0,stand:0}; }
export async function addMeal(food:FoodAnalysis, mealType='Meal', imageUri:string|null=null, thumbnailUri:string|null=null) {
 if(![food.calories,food.protein,food.carbs,food.fat].every(v=>Number.isFinite(v)&&v>=0)) throw new Error('Nutrition values must be valid non-negative numbers.');
 if(!food.description.trim()) throw new Error('Meal description is required.');
 const db=await getDb(); const id=uid(), date=localDateKey(), createdAt=new Date().toISOString();
 await db.withExclusiveTransactionAsync(async tx=>{
  await tx.runAsync('INSERT INTO meals(id,date,meal_type,calories,protein,carbs,fat,description,image_uri,thumbnail_uri,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)',id,date,mealType,food.calories,food.protein,food.carbs,food.fat,food.description,imageUri,thumbnailUri,createdAt);
  await tx.runAsync(`INSERT INTO daily_totals(date,calories,protein,carbs,fat,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(date) DO UPDATE SET calories=calories+excluded.calories,protein=protein+excluded.protein,carbs=carbs+excluded.carbs,fat=fat+excluded.fat,updated_at=excluded.updated_at`,date,food.calories,food.protein,food.carbs,food.fat,createdAt);
 }); return id;
}
export async function deleteMeal(meal:Meal) { const db=await getDb(); await db.withExclusiveTransactionAsync(async tx=>{ const old=await tx.getFirstAsync<Meal>('SELECT * FROM meals WHERE id=?',meal.id); if(!old)return; await tx.runAsync('DELETE FROM meals WHERE id=?',meal.id); await tx.runAsync('UPDATE daily_totals SET calories=MAX(0,calories-?),protein=MAX(0,protein-?),carbs=MAX(0,carbs-?),fat=MAX(0,fat-?),updated_at=? WHERE date=?',old.calories,old.protein,old.carbs,old.fat,new Date().toISOString(),old.date); }); }
export async function reserveScan(type:'food'|'watch') { const db=await getDb(), date=localDateKey(); let id=''; await db.withExclusiveTransactionAsync(async tx=>{ const r=await tx.getFirstAsync<{n:number}>('SELECT COUNT(*) n FROM scan_usage WHERE local_date=? AND status IN (\'reserved\',\'completed\')',date); if((r?.n??0)>=3) throw new Error('Daily AI scan limit reached (3 scans).'); id=uid(); await tx.runAsync('INSERT INTO scan_usage(id,local_date,scan_type,status,created_at) VALUES(?,?,?,?,?)',id,date,type,'reserved',new Date().toISOString()); }); return id; }
export async function finishScan(id:string,success:boolean) { const db=await getDb(); await db.runAsync('UPDATE scan_usage SET status=? WHERE id=? AND status=\'reserved\'',success?'completed':'released',id); }
export async function remainingScans() { const db=await getDb(),date=localDateKey(); const r=await db.getFirstAsync<{n:number}>('SELECT COUNT(*) n FROM scan_usage WHERE local_date=? AND status IN (\'reserved\',\'completed\')',date); return Math.max(0,3-(r?.n??0)); }
export async function saveWatchAnalysis(data:WatchAnalysis) { const db=await getDb(),date=localDateKey(),id=uid(),now=new Date().toISOString(); await db.withExclusiveTransactionAsync(async tx=>{await tx.runAsync('INSERT INTO watch_analyses(id,date,calories,exercise,stand,created_at) VALUES(?,?,?,?,?,?)',id,date,data.calories,data.exercise,data.stand,now); await tx.runAsync('INSERT INTO daily_totals(date,exercise,stand,updated_at) VALUES(?,?,?,?) ON CONFLICT(date) DO UPDATE SET exercise=excluded.exercise,stand=excluded.stand,updated_at=excluded.updated_at',date,data.exercise,data.stand,now);}); }
export async function recoverStaleScanReservations() { const db=await getDb(); const cutoff=new Date(Date.now()-60*60*1000).toISOString(); await db.runAsync("UPDATE scan_usage SET status='released' WHERE status='reserved' AND created_at<?",cutoff); }
export async function updateMeal(meal:Meal) { const db=await getDb(); const now=new Date().toISOString(); await db.withExclusiveTransactionAsync(async tx=>{ const old=await tx.getFirstAsync<Meal>('SELECT * FROM meals WHERE id=?',meal.id); if(!old) throw new Error('Meal no longer exists.'); await tx.runAsync('UPDATE meals SET date=?,meal_type=?,calories=?,protein=?,carbs=?,fat=?,description=?,image_uri=?,thumbnail_uri=? WHERE id=?',meal.date,meal.meal_type,meal.calories,meal.protein,meal.carbs,meal.fat,meal.description,meal.image_uri,meal.thumbnail_uri,meal.id); await tx.runAsync('UPDATE daily_totals SET calories=MAX(0,calories-?),protein=MAX(0,protein-?),carbs=MAX(0,carbs-?),fat=MAX(0,fat-?),updated_at=? WHERE date=?',old.calories,old.protein,old.carbs,old.fat,now,old.date); await tx.runAsync(`INSERT INTO daily_totals(date,calories,protein,carbs,fat,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(date) DO UPDATE SET calories=calories+excluded.calories,protein=protein+excluded.protein,carbs=carbs+excluded.carbs,fat=fat+excluded.fat,updated_at=excluded.updated_at`,meal.date,meal.calories,meal.protein,meal.carbs,meal.fat,now); }); }
export async function recalculateDailyTotals(date=localDateKey()) { const db=await getDb(); await db.withExclusiveTransactionAsync(async tx=>{ const sums=await tx.getFirstAsync<{calories:number;protein:number;carbs:number;fat:number}>('SELECT COALESCE(SUM(calories),0) calories,COALESCE(SUM(protein),0) protein,COALESCE(SUM(carbs),0) carbs,COALESCE(SUM(fat),0) fat FROM meals WHERE date=?',date); const old=await tx.getFirstAsync<{exercise:number;stand:number}>('SELECT exercise,stand FROM daily_totals WHERE date=?',date); await tx.runAsync(`INSERT INTO daily_totals(date,calories,protein,carbs,fat,exercise,stand,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(date) DO UPDATE SET calories=excluded.calories,protein=excluded.protein,carbs=excluded.carbs,fat=excluded.fat,updated_at=excluded.updated_at`,date,sums?.calories??0,sums?.protein??0,sums?.carbs??0,sums?.fat??0,old?.exercise??0,old?.stand??0,new Date().toISOString()); }); }
