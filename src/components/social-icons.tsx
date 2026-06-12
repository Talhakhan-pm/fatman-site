import type { SVGProps } from "react";

function IconSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      focusable="false"
      {...props}
    />
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconSvg {...props}>
      <path d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2Zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5ZM12 7.25A4.75 4.75 0 1 1 12 16.75 4.75 4.75 0 0 1 12 7.25Zm0 2A2.75 2.75 0 1 0 12 14.75 2.75 2.75 0 0 0 12 9.25Zm5.05-2.65a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z" />
    </IconSvg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconSvg {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.25 10.44 22v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.78-3.91 1.09 0 2.23.2 2.23.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.56v1.9h2.77l-.44 2.91h-2.33V22C18.34 21.25 22 17.08 22 12.06Z" />
    </IconSvg>
  );
}

export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconSvg {...props}>
      <path d="M16.6 2c.35 2.98 2.02 4.76 5 4.95v3.36c-1.73.17-3.25-.4-4.95-1.44v6.28c0 7.98-8.7 10.47-12.2 4.75-2.25-3.69-.87-10.17 6.35-10.43v3.54c-.57.09-1.18.23-1.73.42-1.65.56-2.58 1.62-2.32 3.49.5 3.58 7.07 4.64 6.53-2.36V2h3.32Z" />
    </IconSvg>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconSvg {...props}>
      <path d="M18.9 2.75h3.07l-6.7 7.66 7.88 10.42h-6.17l-4.83-6.32-5.53 6.32H3.55l7.17-8.2L3.17 2.75h6.33l4.37 5.78 5.03-5.78Zm-1.08 16.24h1.7L8.58 4.49H6.75l11.07 14.5Z" />
    </IconSvg>
  );
}

export const socialIconMap = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  tiktok: TikTokIcon,
  x: XIcon,
} as const;
