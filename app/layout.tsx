import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'OSP AutoCare | Workshop Management',description:'Mechanical, body and paint workshop management. English & Español.',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,title:'OSP AutoCare',statusBarStyle:'black-translucent'},icons:{icon:[{url:'/favicon.ico?v=transparent-20261027',sizes:'any'},{url:'/icon-32.png?v=transparent-20261027',type:'image/png',sizes:'32x32'}],apple:'/app-icon-180.png'}};
export const viewport={themeColor:'#154e3e'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
