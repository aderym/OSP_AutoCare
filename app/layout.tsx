import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'OSP AutoCare | Workshop Management',description:'Mechanical, body and paint workshop management. English & Español.',icons:{icon:[{url:'/favicon.ico',sizes:'any'},{url:'/icon-32.png',type:'image/png',sizes:'32x32'}],apple:'/apple-touch-icon.png'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
