import Cmdk, {
  JsonStructure,
  filterItems,
  renderJsonStructure,
  useHandleOpenCmdk,
} from ".";
import { useState } from "react";
import React from "react";

const config = {
  component: Cmdk,
  title: "Components/Cmdk",
};

export const Template = () => {
  const [selected, setSelected] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<"root" | "positions">("root");

  useHandleOpenCmdk(setIsOpen);
  const iconProps = {size: 24};

  const items: JsonStructure = [
    {
      heading: "Home",
      id: "home",
      items: [
        {
          children: "Home",
          icon: "home",
          id: "home",
          disabled: true,
          href: "#",
          renderLink: (props) => <a {...props} />,
          iconProps,
        },
        {
          children: "Settings",
          icon: "settings",
          id: "settings",
          disabled: true,
          iconProps,
        },
        {
          children: "Positions",
          icon: "task",
          closeOnSelect: false,
          keywords: ["jobs"],
          id: "positions",
          onClick: () => {
            setPage("positions");
            setSearch("");
          },
          iconProps,
        },
        {
          children: "Candidates",
          icon: "groups",
          id: "users",
          onClick: () => {
            alert("hj");
          },
          iconProps,
        },
      ],
    },
    {
      heading: "External",
      id: "external",
      items: [
        {
          href: "https://google.com",
          children: "Help",
          icon: "headphones",
          id: "support",
          target: "_blank",
          rel: "noopener noreferrer",
          iconProps,
        },
      ],
    },
    {
      heading: "Extra",
      id: "extra",
      items: [
        {
          children: "Privacy policy",
          icon: "flag",
          id: "privacy",
          iconProps,
        },
        {
          children: "User agreement",
          icon: "person",
          id: "user-agreement",
          iconProps,
        },
        {
          children: "About",
          icon: "emergency_share_off",
          id: "about",
          iconProps,
        },
        {
          children: "Career",
          icon: "person",
          id: "career",
          iconProps,
        },
      ],
    },
  ];

  const rootItems = filterItems(items, search);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "#E5E7EB",
        boxSizing: "border-box",
        padding: 0,
        margin: 0,
      }}
    >
      <Cmdk
        onChangeSelected={setSelected}
        onChangeSearch={setSearch}
        onChangeOpen={setIsOpen}
        selected={selected}
        search={search}
        isOpen={isOpen}
        page={page}
        footer={
          <div style={{ paddingInline: "1rem", paddingBlock: "0.75rem" }} className="footer-menu">
            <p>hej</p>
          </div>
        }
      >
        <div className="max-h-80 overflow-y-auto ">
          <ul className=" my-4 p-1 scroll-py-2" 
              tabIndex={-1}
              role="listbox"
            >
            <Cmdk.Page id="root">
              {rootItems.length ? (
                renderJsonStructure(rootItems)
              ) : (
                <Cmdk.FreeSearchAction
                  href={`https://google.com/?q=${search}`}
                  rel="noopener noreferrer"
                  closeOnSelect={false}
                  target="_blank"
                  
                />
              )}
            </Cmdk.Page>

            <Cmdk.Page
              searchPrefix={["Positions"]}
              id="positions"
              onEscape={() => {
                setPage("root");
              }}
            >
              <Cmdk.List heading="Positions">
                <Cmdk.ListItem index={0}>
                  Nothing here
                </Cmdk.ListItem>
              </Cmdk.List>
            </Cmdk.Page>
          </ul>
        </div>
      </Cmdk>
    </div>
  );
};

function Welcome() {
  return (
    <div className="w-full rounded-lg via-indigo-800 to-indigo-400 p-4 border-t border-b ">
      <h2 className="text-lg font-semibold leading-tight text-white">
        Welcome 👋
      </h2>
      <p className="text-sm text-white/80 font-medium max-w-xs mt-1">
        We're really glad you found this! Here you can quickly get to what you
        want to do
      </p>
    </div>
  );
}

export default config;