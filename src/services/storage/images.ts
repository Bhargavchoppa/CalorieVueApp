import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Image } from 'react-native';
const root = `${FileSystem.documentDirectory}calorievue/images/`;
async function ensureDir(path:string) { const info=await FileSystem.getInfoAsync(path); if(!info.exists) await FileSystem.makeDirectoryAsync(path,{intermediates:true}); }
export async function cacheImage(uri:string,kind:'food'|'watch'='food') {
 await ensureDir(root+kind+'/');
 const dims=await new Promise<{width:number;height:number}>((resolve,reject)=>Image.getSize(uri,(width,height)=>resolve({width,height}),reject));
 const max=kind==='food'?384:512; const ratio=Math.min(1,max/Math.max(dims.width,dims.height));
 const width=Math.max(1,Math.round(dims.width*ratio)),height=Math.max(1,Math.round(dims.height*ratio));
 const processed=await manipulateAsync(uri,[{resize:{width,height}}],{compress:.82,format:SaveFormat.JPEG});
 const name=`${Date.now()}-${Math.random().toString(36).slice(2,8)}.jpg`,dest=root+kind+'/'+name;
 await FileSystem.copyAsync({from:processed.uri,to:dest});
 await ensureDir(root+'thumbnails/');
 const side=Math.min(width,height),originX=Math.floor((width-side)/2),originY=Math.floor((height-side)/2);
 const thumb=await manipulateAsync(dest,[{crop:{originX,originY,width:side,height:side}},{resize:{width:140,height:140}}],{compress:.75,format:SaveFormat.JPEG});
 const thumbDest=root+'thumbnails/'+name; await FileSystem.copyAsync({from:thumb.uri,to:thumbDest});
 return {uri:dest,thumbnailUri:thumbDest};
}
export async function deleteCachedImage(uri?:string|null) { if(!uri) return; const info=await FileSystem.getInfoAsync(uri); if(info.exists) await FileSystem.deleteAsync(uri,{idempotent:true}); }
