import { initLlama, releaseAllLlama } from 'llama.rn';
import { z } from 'zod';
import { getModelPaths } from './modelManager';
import type { FoodAnalysis, WatchAnalysis } from '@/types';
const foodSchema=z.object({calories:z.number().finite().nonnegative(),protein:z.number().finite().nonnegative(),carbs:z.number().finite().nonnegative(),fat:z.number().finite().nonnegative(),description:z.string().trim().min(1).max(120)}).strict();
const watchSchema=z.object({calories:z.number().finite().nonnegative(),exercise:z.number().finite().nonnegative(),stand:z.number().finite().nonnegative()}).strict();
type Context=Awaited<ReturnType<typeof initLlama>>;
let context:Context|null=null;
export async function initializeVision(){if(context)return;const paths=await getModelPaths();if(!paths.model||!paths.projector)throw new Error('Import both a compatible vision GGUF model and its matching mmproj file in Settings first.');context=await initLlama({model:paths.model,n_ctx:4096,n_gpu_layers:0,ctx_shift:false,use_mlock:false});const ok=await context.initMultimodal({path:paths.projector,use_gpu:false});if(!ok){await releaseAllLlama();context=null;throw new Error('The selected model/projector pair could not initialize multimodal vision.');}}
async function runImageJson<T>(uri:string,prompt:string,schema:z.ZodType<T>):Promise<T>{if(!context)await initializeVision();const result=await context!.completion({messages:[{role:'user',content:[{type:'text',text:prompt},{type:'image_url',image_url:{url:uri}}]}],temperature:0.1,n_predict:256,response_format:{type:'json_object'}});let raw=result.content.trim();raw=raw.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');const parsed=JSON.parse(raw);return schema.parse(parsed);}
export async function analyzeFood(uri:string):Promise<FoodAnalysis>{return runImageJson(uri,'Analyze the visible food and estimate calories, protein grams, carbohydrate grams, fat grams and a concise meal name. Estimate only what is visible. Return ONLY JSON with exactly these keys: calories, protein, carbs, fat, description.',foodSchema);}
export async function analyzeWatch(uri:string):Promise<WatchAnalysis>{return runImageJson(uri,'Read the fitness watch screenshot. Extract active calories, exercise minutes and stand hours. If a value is not clearly visible, do not guess; return JSON only with exactly these keys: calories, exercise, stand.',watchSchema);}
export async function unloadVision(){await releaseAllLlama();context=null;}
