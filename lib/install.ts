export type InstallPlatform='ios'|'android'|'mac'|'desktop';
export function installPlatform(ua:string,touchPoints=0):InstallPlatform{
 if(/iPad|iPhone|iPod/i.test(ua)||/Macintosh/i.test(ua)&&touchPoints>1)return 'ios';
 if(/Android/i.test(ua))return 'android';
 if(/Macintosh|Mac OS X/i.test(ua))return 'mac';
 return 'desktop';
}
export const installDismissKey='osp-install-dismissed-until';
export function canSuggestInstall(standalone:boolean,until:number,time=Date.now()){return !standalone&&(!Number.isFinite(until)||until<=time);}
