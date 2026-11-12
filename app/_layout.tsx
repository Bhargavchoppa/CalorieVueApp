import 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { getDb } from '@/services/database/db';
export default function RootLayout(){useEffect(()=>{getDb().catch(console.error)},[]);return <><StatusBar style="light"/><Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:'#050805'}}}><Stack.Screen name="index"/><Stack.Screen name="onboarding"/><Stack.Screen name="(tabs)"/><Stack.Screen name="add" options={{presentation:'modal'}}/></Stack></>}
