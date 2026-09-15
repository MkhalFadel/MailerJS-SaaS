import Icon from "../icons/Icon";
import styles from "./emptyState.module.css";

function EmptyState({ actionLabel, description, icon = "campaign", onAction, title })
{
   return (
      <div className={styles.state}>
         <span className={styles.icon}>
            <Icon name={icon} size={25} />
         </span>

         <h2>{title}</h2>

         <p>{description}</p>

         {onAction && actionLabel && (
            <button className={styles.action} onClick={onAction} type="button">
               <Icon name="plus" size={16} />
               {actionLabel}
            </button>
         )}
      </div>
   );
}

export default EmptyState;
