"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";

const font = "'DM Sans','Outfit',system-ui,sans-serif";
const C = {
  primary: "#D4820A", bg: "#FDF3E3", bgAlt: "#FFF8F0", bgCard: "#fff",
  border: "#F5D5A0", text: "#1A0E00", textMid: "#4A3010", textLight: "#7A5828",
  success: "#059669", successBg: "#ECFDF5",
  danger: "#DC2626", dangerBg: "#FEF2F2",
  warning: "#D97706", warningBg: "#FFFBEB",
  blue: "#2563EB", blueBg: "#EFF6FF",
};

interface TaxEvent {
  id: string; title: string; country: string; flag: string;
  type: string; amount: number; currency: string;
  dueDate: string; status: "upcoming"|"overdue"|"paid"|"pending";
  period: string; notes: string;
}

const DEMO_EVENTS: TaxEvent[] = [
  { id:"1", title:"VAT Return Q1 2026", country:"Saudi Arabia", flag:"🇸🇦", type:"VAT 15%", amount:18400, currency:"SAR", dueDate:"2026-04-30", status:"upcoming", period:"Jan–Mar 2026", notes:"ZATCA e-filing required" },
  { id:"2", title:"KDV Beyannamesi Nisan", country:"Turkey", flag:"🇹🇷", type:"KDV 20%", amount:42800, currency:"TRY", dueDate:"2026-04-26", status:"overdue", period:"March 2026", notes:"Monthly declaration via GİB" },
  { id:"3", title:"VAT Return Q1 2026", country:"UAE", flag:"🇦🇪", type:"VAT 5%", amount:3400, currency:"AED", dueDate:"2026-05-05", status:"upcoming", period:"Jan–Mar 2026", notes:"FTA e-service portal" },
  { id:"4", title:"Corporate Tax FY2025", country:"Saudi Arabia", flag:"🇸🇦", type:"CIT 20%", amount:84000, currency:"SAR", dueDate:"2026-06-30", status:"upcoming", period:"FY 2025", notes:"Annual corporate income tax" },
  { id:"5", title:"VAT Return Q4 2025", country:"Kuwait", flag:"🇰🇼", type:"VAT 0%", amount:0, currency:"KWD", dueDate:"2026-01-31", status:"paid", period:"Oct–Dec 2025", notes:"Kuwait VAT not yet implemented" },
  { id:"6", title:"KDV Beyannamesi Mart", country:"Turkey", flag:"🇹🇷", type:"KDV 20%", amount:38600, currency:"TRY", dueDate:"2026-03-26", status:"paid", period:"February 2026", notes:"Monthly declaration via GİB" },
];

const statusCfg = {
  upcoming: { color:"#2563EB", bg:"#EFF6FF", label:"Upcoming", icon:"📅" },
  overdue:  { color:"#DC2626", bg:"#FEF2F2", label:"Overdue",  icon:"🚨" },
  paid:     { color:"#059669", bg:"#ECFDF5", label:"Paid",     icon:"✅" },
  pending:  { color:"#D97706", bg:"#FFFBEB", label:"Pending",  icon:"⏳" },
};

const sym: Record<string,string> = { SAR:"﷼", AED:"د.إ", TRY:"₺", KWD:"د.ك", USD:"$", EUR:"€" };

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function TaxCalendarPage() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const dir = locale === "ar" ? "rtl" : "ltr";
  function L(en: string, ar: string, tr: string) { return locale==="ar"?ar:locale==="tr"?tr:en; }

  const [events] = useState<TaxEvent[]>(DEMO_EVENTS);
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<"list"|"calendar">("list");
  const [selected, setSelected] = useState<TaxEvent|null>(null);
  const [currentMonth, setCurrentMonth] = useState(3); // April (0-indexed)

  const filtered = events.filter(e => filter==="all" || e.status===filter || e.flag===filter);

  const upcomingCount = events.filter(e=>e.status==="upcoming").length;
  const overdueCount  = events.filter(e=>e.status==="overdue").length;
  const totalDue = events.filter(e=>e.status!=="paid").reduce((s,e)=>s+(e.currency==="SAR"?e.amount:e.currency==="TRY"?e.amount/30:e.amount*3),0);

  const kpis = [
    { label:L("Upcoming","قادمة","Yaklaşan"), value:upcomingCount, color:C.blue, icon:"📅" },
    { label:L("Overdue","متأخرة","Gecikmiş"), value:overdueCount, color:C.danger, icon:"🚨" },
    { label:L("Paid This Year","مدفوعة هذا العام","Bu Yıl Ödenen"), value:events.filter(e=>e.status==="paid").length, color:C.success, icon:"✅" },
    { label:L("Est. Due (SAR equiv.)","المستحق (بالريال)","Tahmini (SAR)"), value:`~${Math.round(totalDue/1000)}K`, color:C.primary, icon:"💰" },
  ];

  // Build mini calendar for current month
  const year = 2026;
  const firstDay = new Date(year, currentMonth, 1).getDay();
  const daysInMonth = new Date(year, currentMonth+1, 0).getDate();
  const calDays: (number|null)[] = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];

  const eventsForDay = (day: number) => events.filter(e => {
    const d = new Date(e.dueDate);
    return d.getFullYear()===year && d.getMonth()===currentMonth && d.getDate()===day;
  });

  return (
    <div style={{ fontFamily:font, backgroundColor:C.bg, minHeight:"100vh" }} dir={dir}>
      <header style={{ backgroundColor:C.bgCard, borderBottom:`1.5px solid ${C.border}`, padding:"0 28px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <a href={`/${locale}/dashboard`} style={{ fontSize:13, color:C.primary, fontWeight:700, textDecoration:"none" }}>← {L("Dashboard","اللوحة","Panel")}</a>
          <span style={{ color:C.border }}>/</span>
          <span style={{ fontSize:14, fontWeight:800, color:C.text }}>🧾 {L("Tax Calendar","تقويم الضرائب","Vergi Takvimi")}</span>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {(["list","calendar"] as const).map((v,i) => (
            <button key={i} onClick={()=>setView(v)} style={{ padding:"7px 16px", borderRadius:9, border:"none", cursor:"pointer", fontFamily:font, fontSize:12, fontWeight:700, backgroundColor:view===v?C.primary:"transparent", color:view===v?"#fff":C.textLight }}>
              {v==="list"?L("List","قائمة","Liste"):"📅 "+L("Calendar","تقويم","Takvim")}
            </button>
          ))}
        </div>
      </header>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px" }}>
        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14, marginBottom:24 }}>
          {kpis.map((k,i) => (
            <div key={i} style={{ backgroundColor:C.bgCard, border:`1.5px solid ${C.border}`, borderRadius:14, padding:"18px 20px", borderTop:`4px solid ${k.color}` }}>
              <div style={{ fontSize:22, marginBottom:8 }}>{k.icon}</div>
              <div style={{ fontSize:24, fontWeight:900, color:k.color, fontFamily:"monospace" }}>{k.value}</div>
              <div style={{ fontSize:12, color:C.textLight, marginTop:4, fontWeight:600 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Overdue alert */}
        {overdueCount > 0 && (
          <div style={{ backgroundColor:C.dangerBg, border:`1.5px solid #FCA5A5`, borderRadius:12, padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:20 }}>🚨</span>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:C.danger }}>{overdueCount} {L("overdue tax filing(s)","إقرار(ات) ضريبية متأخرة","gecikmiş vergi beyannamesi")}</div>
              <div style={{ fontSize:12, color:"#B91C1C" }}>{L("Immediate action required to avoid penalties.","يلزم التصرف الفوري لتجنب الغرامات.","Ceza almamak için acil işlem yapılması gerekiyor.")}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display:"flex", gap:5, backgroundColor:C.bgCard, border:`1px solid ${C.border}`, borderRadius:10, padding:4, marginBottom:20, flexWrap:"wrap" }}>
          {[["all",L("All","الكل","Tümü")],["upcoming",L("Upcoming","قادمة","Yaklaşan")],["overdue",L("Overdue","متأخرة","Gecikmiş")],["paid",L("Paid","مدفوعة","Ödenen")],["🇸🇦","SA"],["🇹🇷","TR"],["🇦🇪","UAE"]].map(([val,label],i) => (
            <button key={i} onClick={()=>setFilter(val)} style={{ padding:"6px 12px", borderRadius:8, border:"none", cursor:"pointer", fontFamily:font, fontSize:12, fontWeight:700, backgroundColor:filter===val?C.primary:"transparent", color:filter===val?"#fff":C.textLight }}>
              {label}
            </button>
          ))}
        </div>

        {view === "list" ? (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {filtered.sort((a,b)=>{
              const order = {overdue:0, upcoming:1, pending:2, paid:3};
              return order[a.status]-order[b.status];
            }).map((e,i) => {
              const sc = statusCfg[e.status];
              const daysLeft = Math.round((new Date(e.dueDate).getTime()-Date.now())/(1000*86400));
              return (
                <div key={i} onClick={()=>setSelected(e)} style={{ backgroundColor:C.bgCard, border:`1.5px solid ${e.status==="overdue"?"#FCA5A5":C.border}`, borderRadius:14, padding:"18px 22px", display:"flex", alignItems:"center", gap:18, cursor:"pointer" }}>
                  <div style={{ fontSize:28, flexShrink:0 }}>{e.flag}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:800, color:C.text, marginBottom:4 }}>{e.title}</div>
                    <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                      <span style={{ fontSize:12, color:C.textLight }}>{e.country}</span>
                      <span style={{ fontSize:12, color:C.primary, fontWeight:600 }}>{e.type}</span>
                      <span style={{ fontSize:12, color:C.textLight }}>{e.period}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    {e.amount > 0 && <div style={{ fontSize:18, fontWeight:900, color:C.primary, fontFamily:"monospace" }}>{sym[e.currency]||e.currency}{e.amount.toLocaleString()}</div>}
                    <div style={{ fontSize:12, color:e.status==="overdue"?C.danger:C.textLight, fontWeight:600 }}>
                      {e.status==="paid" ? L("Paid","مدفوعة","Ödendi") : e.status==="overdue" ? `${Math.abs(daysLeft)} ${L("days overdue","يوم تأخير","gün gecikmiş")}` : `${daysLeft} ${L("days left","يوم متبقٍ","gün kaldı")}`}
                    </div>
                  </div>
                  <span style={{ fontSize:11, fontWeight:800, padding:"3px 10px", borderRadius:20, backgroundColor:sc.bg, color:sc.color, flexShrink:0 }}>{sc.icon} {sc.label}</span>
                </div>
              );
            })}
          </div>
        ) : (
          /* Calendar view */
          <div style={{ backgroundColor:C.bgCard, border:`1.5px solid ${C.border}`, borderRadius:16, overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 24px", borderBottom:`1px solid ${C.border}` }}>
              <button onClick={()=>setCurrentMonth(p=>Math.max(0,p-1))} style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${C.border}`, backgroundColor:"transparent", cursor:"pointer", fontFamily:font, fontWeight:700, color:C.textMid }}>←</button>
              <div style={{ fontSize:16, fontWeight:800, color:C.text }}>{MONTHS[currentMonth]} {year}</div>
              <button onClick={()=>setCurrentMonth(p=>Math.min(11,p+1))} style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${C.border}`, backgroundColor:"transparent", cursor:"pointer", fontFamily:font, fontWeight:700, color:C.textMid }}>→</button>
            </div>
            <div style={{ padding:20 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:8 }}>
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d,i) => (
                  <div key={i} style={{ textAlign:"center", fontSize:11, fontWeight:700, color:C.textLight, padding:"6px 0" }}>{d}</div>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
                {calDays.map((day,i) => {
                  const dayEvents = day ? eventsForDay(day) : [];
                  const hasOverdue = dayEvents.some(e=>e.status==="overdue");
                  const hasUpcoming = dayEvents.some(e=>e.status==="upcoming");
                  return (
                    <div key={i} style={{ minHeight:60, padding:6, borderRadius:8, backgroundColor:day?hasOverdue?C.dangerBg:hasUpcoming?C.blueBg:C.bgAlt:"transparent", border:`1px solid ${day?hasOverdue?"#FCA5A5":hasUpcoming?"#93C5FD":C.border:"transparent"}`, cursor:dayEvents.length>0?"pointer":"default" }} onClick={()=>dayEvents.length>0&&setSelected(dayEvents[0])}>
                      {day && (
                        <>
                          <div style={{ fontSize:12, fontWeight:700, color:hasOverdue?C.danger:hasUpcoming?C.blue:C.textMid }}>{day}</div>
                          {dayEvents.slice(0,2).map((e,j) => (
                            <div key={j} style={{ fontSize:9, fontWeight:700, color:statusCfg[e.status].color, backgroundColor:statusCfg[e.status].bg, borderRadius:4, padding:"1px 4px", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                              {e.flag} {e.type}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,.35)", display:"flex", alignItems:"center", justifyContent:"flex-end", zIndex:1000 }} onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
          <div style={{ width:400, height:"100vh", backgroundColor:C.bgCard, boxShadow:"-8px 0 40px rgba(0,0,0,.15)", padding:24, overflowY:"auto" }} dir={dir}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ fontWeight:800, fontSize:16, color:C.text }}>{L("Tax Filing Details","تفاصيل الإقرار","Beyanname Detayı")}</div>
              <button onClick={()=>setSelected(null)} style={{ width:32, height:32, borderRadius:"50%", border:`1px solid ${C.border}`, backgroundColor:C.bgAlt, cursor:"pointer", fontSize:16 }}>✕</button>
            </div>
            <div style={{ fontSize:32, textAlign:"center", marginBottom:12 }}>{selected.flag}</div>
            <div style={{ fontSize:16, fontWeight:800, color:C.text, textAlign:"center", marginBottom:20 }}>{selected.title}</div>
            {[
              [L("Country","الدولة","Ülke"), selected.country],
              [L("Tax Type","نوع الضريبة","Vergi Türü"), selected.type],
              [L("Period","الفترة","Dönem"), selected.period],
              [L("Amount Due","المبلغ المستحق","Vadesi Gelen"), selected.amount > 0 ? `${sym[selected.currency]||selected.currency}${selected.amount.toLocaleString()}` : L("N/A","لا ينطبق","Yok")],
              [L("Due Date","تاريخ الاستحقاق","Son Tarih"), selected.dueDate],
              [L("Status","الحالة","Durum"), `${statusCfg[selected.status].icon} ${statusCfg[selected.status].label}`],
              [L("Notes","ملاحظات","Notlar"), selected.notes],
            ].map(([label,value],i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:i<6?`1px solid ${C.border}`:"none", flexWrap:"wrap", gap:6 }}>
                <span style={{ fontSize:12, color:C.textLight, fontWeight:600 }}>{label}</span>
                <span style={{ fontSize:13, fontWeight:700, color:C.text, textAlign:"right" }}>{value}</span>
              </div>
            ))}
            {selected.status !== "paid" && (
              <button style={{ width:"100%", marginTop:20, padding:12, borderRadius:12, border:"none", backgroundColor:C.primary, color:"#fff", fontFamily:font, fontSize:13, fontWeight:700, cursor:"pointer" }}>
                ✅ {L("Mark as Paid","تعليم كمدفوعة","Ödendi Olarak İşaretle")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}