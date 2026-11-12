export const localDateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
