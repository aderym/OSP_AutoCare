import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'OSP AutoCare | Workshop Management',description:'Mechanical, body and paint workshop management. English & Español.',icons:{icon:[{url:'/favicon.ico?v=transparent-20261027',sizes:'any'},{url:'/icon-32.png?v=transparent-20261027',type:'image/png',sizes:'32x32'}],apple:'/apple-touch-icon.png?v=transparent-20261027'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
