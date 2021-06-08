export default function getKey(type?: string): string {
  return type + Date.now().toString().slice(4, 8) + Math.random().toString().slice(3, 5);
}