import { Snackbar } from "~/ui";
import React from "react";
import { useShowNextError } from "~/hooks/use-catch"
import { snackBarDurationLongMs, snackBarDurationShortMs } from "~/utils/constant";
import { i18n } from "~/utils/i18n";

function getErrorMessage(error:any) {
   if (!error) {
       return null;
   }

   if (typeof error === 'string'){
      return error;
   }

   if (typeof error === 'object' ){
      if (error.error){
         return getErrorMessage(error.error)
      }
      if (error.message){
         return getErrorMessage(error.message)
      }

      return i18n.get('Something wont wrong.')
   }

   if (Array.isArray(error)) {
      for (let val of error){
           return getErrorMessage(val);
      }
   }

   return i18n.get('Something wont wrong.')

}

export const ErrorCatch = ()=> {
    const [error, onClose]  = useShowNextError()
    const message = React.useMemo(()=> getErrorMessage(error), [error])
    //console.error("ErrorCatch error:", error)
    return (
        <Snackbar
          open={!!message}
          message={message}
          onClose={onClose}
          autoHideDuration={snackBarDurationLongMs}
          ContentProps={{className: 'bg-red-500'}}
        />
      );

}