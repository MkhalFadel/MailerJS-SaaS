import styles from "./brandLoader.module.css";

function BrandLoader({ className = "", label = "Loading", size = "md" })
{
   const isDecorative = !label;

   return (
      <span
         aria-hidden={isDecorative ? "true" : undefined}
         aria-live={isDecorative ? undefined : "polite"}
         className={`${styles.loader} ${styles[size] || styles.md} ${className}`}
         role={isDecorative ? undefined : "status"}
      >
         <svg
            aria-hidden="true"
            className={styles.mark}
            focusable="false"
            viewBox="0 0 48 48"
         >
            <rect className={styles.base} height="44" rx="11" width="44" x="2" y="2" />
            <path
               className={`${styles.path} ${styles.envelope}`}
               d="M12 32V16.5L24 26L36 16.5V32"
            />
            <path
               className={`${styles.path} ${styles.fold}`}
               d="M12 16.5L24 26L36 16.5"
            />
            <path
               className={`${styles.path} ${styles.delivery}`}
               d="M30.5 31H36M33.5 28L36.5 31L33.5 34"
            />
         </svg>

         {label && <span className={styles.label}>{label}</span>}
      </span>
   );
}

export default BrandLoader;
