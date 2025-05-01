import React, { forwardRef, Fragment, Ref, useRef } from "react";
import { useRefs } from "../../../../../ui/src/hooks";
import SearchIcon from "../../../../../ui/src/components/internal/svg-icons/Search";

interface SearchProps {
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string[];
  value: string;
}

function Search(
  { onChange, placeholder, prefix, value }: SearchProps,
  ref: Ref<HTMLInputElement>
) {
  const inputRef = useRefs(ref, useRef<HTMLInputElement>());

  return (
    <div className="flex items-center gap-1.5 ps-3">
      <SearchIcon size={28}
      className="pointer-events-none text-gray-400 dark:text-gray-600" />

      {prefix?.length
        ? prefix.map((p) => {
            return (
              <Fragment key={p}>
                <span className="dark:text-white">{p}</span>
                <span className="text-gray-500">/</span>
              </Fragment>
            );
          })
        : null}

      <div className="flex-1 relative inline-flex items-center pe-2">
        <input
          ref={inputRef}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          
          className="py-4 px-0 border-none w-full focus:outline-none focus:border-none focus:ring-0 bg-transparent placeholder-gray-500 dark:text-white"
          onChange={(e) => {
            onChange(e.currentTarget.value);
          }}
          onFocus={(e) => {
            e.currentTarget.select();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape" && value) {
              e.preventDefault();
              e.stopPropagation();
              onChange("");
            }
          }}
          id="command-palette-search-input"
          placeholder={placeholder}
          value={value}
          type="text"
          autoFocus
        />

        {value && (
          <button
            className="inline-flex items-center"
            tabIndex={-1}
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
              /*
              const inputElement = document.getElementById(
                "command-palette-search-input"
              );
              if (inputElement) {
                inputElement.focus();
              }*/
            }}
          >
            <SearchIcon 
               fontSize={20}
                className="text-hd-md hover:text-hd-lg transition" />
          </button>
        )}
      </div>
    </div>
  );
}

export default forwardRef(Search);
