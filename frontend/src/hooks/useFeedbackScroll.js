import { useCallback, useEffect, useRef } from "react";

function useFeedbackScroll(feedback)
{
   const feedbackRef = useRef(null);
   const shouldScrollRef = useRef(false);

   const requestFeedbackScroll = useCallback(() => {
      shouldScrollRef.current = true;
   },[]);

   useEffect(() => {
      if(!feedback || !shouldScrollRef.current || !feedbackRef.current)
         return;

      shouldScrollRef.current = false;

      const animationFrame = window.requestAnimationFrame(() => {
         const feedbackElement = feedbackRef.current;

         if(!feedbackElement)
            return;

         const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
         ).matches;

         feedbackElement.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "center"
         });
         feedbackElement.focus({ preventScroll: true });
      });

      return () => {
         window.cancelAnimationFrame(animationFrame);
      };
   },[feedback]);

   return {
      feedbackRef,
      requestFeedbackScroll
   };
}

export default useFeedbackScroll;
