import { forwardRef } from "react";
import classNames from "~/utils/classNames";

interface InputProps {
  value: string;
  placeholder: string;
  handleInputChange: (str: string) => void;
}

type Ref = HTMLTextAreaElement;

const Textarea = forwardRef<Ref, InputProps>(
  ({ value, placeholder, handleInputChange }, ref) => (
    <>
      <div className="relative w-full min-w-[200px]">
        <textarea
          ref={(() => {
            // If ref is passed, use it, otherwise use null
            if (ref) return ref;
            return null;
          })()}
          className={classNames(
            value.length > 0 && "border-t-transparent",
            `border-blue-gray-200 text-blue-gray-700 disabled:bg-blue-gray-50 peer h-full min-h-[100px] 
                w-full resize-none rounded-md border bg-transparent px-3 py-3 font-sans 
                text-gray-200 focus:border-2 focus:border-pink-500 focus:border-t-transparent focus:outline-0 
                disabled:resize-none disabled:border-0`
          )}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder=" "
        ></textarea>
        <label
          className={`before:content[' '] after:content[' '] text-blue-gray-400 
            before:border-blue-gray-200 after:border-blue-gray-200 peer-placeholder-shown:text-blue-gray-500 
            peer-disabled:peer-placeholder-shown:text-blue-gray-500 pointer-events-none absolute -top-1.5 left-0 
            flex h-full w-full select-none text-[11px] font-normal leading-tight text-gray-200 transition-all 
            before:pointer-events-none before:mr-1 before:mt-[6.5px] before:box-border before:block before:h-1.5 before:w-2.5 
            before:rounded-tl-md before:border-l before:border-t before:transition-all after:pointer-events-none 
            after:ml-1 after:mt-[6.5px] after:box-border after:block after:h-1.5 after:w-2.5 
            after:flex-grow after:rounded-tr-md after:border-r after:border-t 
            after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.1] 
            peer-placeholder-shown:before:border-transparent 
            peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight 
            peer-focus:text-pink-500 
            peer-focus:before:border-l-2 peer-focus:before:border-t-2 peer-focus:before:border-pink-500 
            peer-focus:after:border-r-2 peer-focus:after:border-t-2 peer-focus:after:border-pink-500 
            peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent`}
        >
          {placeholder}
        </label>
      </div>
    </>
  )
);

Textarea.displayName = "Textarea";

export default Textarea;
