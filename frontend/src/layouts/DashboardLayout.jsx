import { NavLink, Outlet } from 'react-router-dom'
import { Bell, ChevronDown, FolderKanban, Home, LayoutDashboard, ListChecks, Moon, Settings, Users, FileText, BarChart3, Activity, Bug, Search, Menu } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleSidebar } from '../redux/uiSlice'

const nav=[
 ['Dashboard','/dashboard',LayoutDashboard],['Projects','/projects',FolderKanban],['Tasks','/tasks',ListChecks],['Issues','/issues',Bug],['Team','/team',Users],['Documents','/documents',FileText],['Analytics','/analytics',BarChart3],['Activity','#',Activity],['Notifications','#',Bell],['Settings','/settings',Settings]
]
export default function DashboardLayout(){
 const collapsed=useSelector(s=>s.ui.sidebarCollapsed); const dispatch=useDispatch()
 return <div className="min-h-screen bg-[#060b17] text-slate-100">
  <aside className={`fixed inset-y-0 left-0 z-40 hidden border-r border-white/10 bg-[#070d1b]/95 backdrop-blur-xl transition-all lg:block ${collapsed?'w-20':'w-[268px]'}`}>
   <div className="flex h-full flex-col p-4">
    <div className="flex items-center gap-3 px-2 py-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20"><span className="text-xl font-black">G</span></div>{!collapsed&&<span className="text-2xl font-bold tracking-tight">Genome</span>}</div>
    <nav className="mt-7 space-y-1">{nav.map(([label,to,Icon])=><NavLink key={label} to={to} className={({isActive})=>`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive?'bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/20':'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Icon size={19}/>{!collapsed&&<span>{label}</span>}{label==='Notifications'&&!collapsed&&<span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-violet-600 px-1 text-[11px]">4</span>}</NavLink>)}</nav>
    <div className="mt-auto space-y-4">
      {!collapsed&&<div className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><p className="text-xs text-slate-500">Active Project</p><div className="mt-3 flex items-center gap-2 text-sm font-medium"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]"/>Genome Platform<ChevronDown size={15} className="ml-auto text-slate-500"/></div></div>}
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-3"><div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-orange-300 to-amber-700"><div className="grid h-full place-items-center text-sm font-bold text-slate-900">V</div></div>{!collapsed&&<div className="min-w-0"><p className="text-sm font-semibold">Vineet</p><p className="truncate text-xs text-slate-500">vineet@example.com</p></div>}</div>
    </div>
   </div>
  </aside>
  <main className={`${collapsed?'lg:pl-20':'lg:pl-[268px]'}`}>
   <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/10 bg-[#060b17]/80 px-5 backdrop-blur-xl lg:px-8">
    <div className="flex items-center gap-3"><button onClick={()=>dispatch(toggleSidebar())} className="hidden rounded-lg p-2 text-slate-400 hover:bg-white/5 lg:block"><Menu size={20}/></button><div className="flex w-[360px] items-center gap-3 rounded-xl border border-white/10 bg-white/[.035] px-3 py-2.5"><Search size={18} className="text-slate-500"/><input placeholder="Search anything..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"/><kbd className="rounded bg-white/5 px-2 py-1 text-[10px] text-slate-500">⌘ K</kbd></div></div>
    <div className="flex items-center gap-3"><button className="rounded-full p-2 text-slate-400 hover:bg-white/5"><Bell size={20}/><span className="absolute ml-3 -mt-7 grid h-4 w-4 place-items-center rounded-full bg-violet-600 text-[9px]">4</span></button><button className="rounded-full p-2 text-slate-400 hover:bg-white/5"><Moon size={20}/></button><div className="ml-1 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-gradient-to-br from-orange-300 to-amber-700 font-bold text-slate-900">V</div></div>
   </header>
   <div className="p-5 lg:p-8"><Outlet/></div>
  </main>
 </div>
}
