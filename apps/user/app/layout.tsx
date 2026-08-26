import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getBranding } from "@/lib/branding";
import { MainWithHeaderOffset } from "@/components/templates/MainWithHeaderOffset";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata = {
  title: { default: "Paxbook — Travel, Explore, Experience", template: "%s | Paxbook" },
  description: "Handpicked holiday packages, custom itineraries, and expert travel consultants.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const branding = await getBranding();
  const primaryColor = branding.primaryColor ?? "#0f4c81";

  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${sora.variable}`}
      style={
        {
          "--tenant-primary": primaryColor,
          "--tenant-primary-dark": `color-mix(in srgb, ${primaryColor} 80%, black)`,
          "--tenant-primary-light": `color-mix(in srgb, ${primaryColor} 12%, white)`,
        } as React.CSSProperties
      }
    >
      <body className="flex min-h-screen flex-col bg-white font-sans">
        {branding.ga4MeasurementId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${branding.ga4MeasurementId}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${branding.ga4MeasurementId}');`}
            </Script>
          </>
        ) : null}
        {branding.facebookPixelId ? (
          <Script id="facebook-pixel-init" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${branding.facebookPixelId}');
              fbq('track', 'PageView');`}
          </Script>
        ) : null}
        <Header />
        <MainWithHeaderOffset>{children}</MainWithHeaderOffset>
        <Footer />
      </body>
    </html>
  );
}
