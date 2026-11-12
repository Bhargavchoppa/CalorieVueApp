import { useEffect,useState } from 'react';
import { View,ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { getProfile } from '@/services/database/db';
export default function Index(){const [route,setRoute]=useState<'onboarding'|'home'|null>(null);useEffect(()=>{getProfile().then(p=>setRoute(p?'home':'onboarding')).catch(()=>setRoute('onboarding'))},[]);if(!route)return <View className="flex-1 bg-[#050805] items-center justify-center"><ActivityIndicator color="#2FEF10" size="large"/></View>;return <Redirect href={route==='home'? '/(tabs)':'/onboarding'}/>}
