import { Link } from "react-router-dom";
import Icon from "../icons/Icon";
import styles from "./backButton.module.css";

function BackButton({ children, centered = false, onClick, to })
{
   const className = [
      styles.backButton,
      centered ? styles.centered : ""
   ].filter(Boolean).join(" ");

   const content = (
      <>
         <Icon name="arrowLeft" size={17} />
         <span>{children}</span>
      </>
   );

   if(to)
   {
      return (
         <Link className={className} to={to}>
            {content}
         </Link>
      );
   }

   return (
      <button className={className} onClick={onClick} type="button">
         {content}
      </button>
   );
}

export default BackButton;
