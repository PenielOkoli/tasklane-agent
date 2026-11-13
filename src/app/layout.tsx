import type { Metadata } from 'next';
import '@fontsource-variable/dm-sans';
import './globals.css';
export const metadata: Metadata = { title: 'Tasklane Agent — A clear path forward.', description: 'A supervised project assistant with visible plans, approval checkpoints and a traceable activity log.' };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }

