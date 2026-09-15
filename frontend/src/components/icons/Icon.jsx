function Icon({ name, size = 20, className, title })
{
   const commonProps = {
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 1.8
   };

   const icons = {
      dashboard: (
         <>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
         </>
      ),
      campaign: (
         <>
            <path d="m3 6 9 6 9-6" />
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 18 6.5-6" />
            <path d="m21 18-6.5-6" />
         </>
      ),
      template: (
         <>
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8h8" />
            <path d="M8 12h8" />
            <path d="M8 16h5" />
         </>
      ),
      contacts: (
         <>
            <circle cx="9" cy="8" r="3" />
            <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
            <path d="M16 10a3 3 0 1 0-1.4-5.6" />
            <path d="M17 14.5a4.8 4.8 0 0 1 3.5 4.5" />
         </>
      ),
      settings: (
         <>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.2 2.2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3.2v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.2-2.2.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4.8v-3.2H5a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.2-2.2.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h3.2v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.2 2.2-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v3.2h-.2a1.7 1.7 0 0 0-1.5 1Z" />
         </>
      ),
      menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
      bell: (
         <>
            <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
         </>
      ),
      chevronDown: <path d="m7 10 5 5 5-5" />,
      sun: (
         <>
            <circle cx="12" cy="12" r="3.5" />
            <path d="M12 2v2" /><path d="M12 20v2" />
            <path d="m4.9 4.9 1.4 1.4" /><path d="m17.7 17.7 1.4 1.4" />
            <path d="M2 12h2" /><path d="M20 12h2" />
            <path d="m4.9 19.1 1.4-1.4" /><path d="m17.7 6.3 1.4-1.4" />
         </>
      ),
      moon: <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />,
      search: (
         <>
            <circle cx="10.5" cy="10.5" r="5.5" />
            <path d="m15 15 4.5 4.5" />
         </>
      ),
      plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
      arrowLeft: <><path d="m12 19-7-7 7-7" /><path d="M5 12h14" /></>,
      arrowRight: <><path d="m12 5 7 7-7 7" /><path d="M19 12H5" /></>,
      close: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
      more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
      upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></>,
      send: <><path d="m21 3-7 18-4-8-8-4Z" /><path d="m10 13 4-4" /></>,
      edit: <><path d="m4 20 4.3-1 10-10a2.1 2.1 0 0 0-3-3l-10 10Z" /><path d="m13.5 6.5 3 3" /></>,
      trash: <><path d="M4 7h16" /><path d="M10 11v5" /><path d="M14 11v5" /><path d="M6 7l1 13h10l1-13" /><path d="M9 7V4h6v3" /></>,
      eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
      eyeOff: <><path d="m3 3 18 18" /><path d="M10.6 6.2A10.6 10.6 0 0 1 12 6c6 0 9.5 6 9.5 6a17.6 17.6 0 0 1-3.2 3.7" /><path d="M6.3 6.3A17.7 17.7 0 0 0 2.5 12S6 18 12 18a10.9 10.9 0 0 0 3.2-.5" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
      check: <path d="m5 12 4.5 4.5L19 7" />,
      alert: <><path d="M12 3 2.8 20h18.4Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
      account: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>
   };

   return (
      <svg
         aria-hidden={title ? undefined : true}
         aria-label={title}
         className={className}
         height={size}
         role={title ? "img" : undefined}
         viewBox="0 0 24 24"
         width={size}
         {...commonProps}
      >
         {title && <title>{title}</title>}
         {icons[name] || icons.alert}
      </svg>
   );
}

export default Icon;
