import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import { publicCSS } from './PublicStyles';

export default function PublicPageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: publicCSS }} />
      <PublicHeader />
      {children}
      <PublicFooter />
    </>
  );
}
