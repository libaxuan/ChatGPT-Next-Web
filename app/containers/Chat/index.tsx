import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";

import { useAppConfig, useChatStore } from "@/app/store";

import Locale from "@/app/locales";
import { useLocation, useNavigate } from "react-router-dom";
import { Path } from "@/app/constant";
import { useEffect } from "react";

import AddIcon from "@/app/icons/addIcon.svg";
import FreeTimeAITitle from "@/app/icons/nextchatTitle.svg";

import MenuLayout from "@/app/components/MenuLayout";
import Panel from "./ChatPanel";
import Modal from "@/app/components/Modal";
import SessionItem from "./components/SessionItem";
import styles from "@/app/components/home.module.scss";

export default MenuLayout(function SessionList(props) {
  const { setShowPanel } = props;

  const [sessions, selectedIndex, selectSession, moveSession] = useChatStore(
    (state) => [
      state.sessions,
      state.currentSessionIndex,
      state.selectSession,
      state.moveSession,
    ],
  );
  const navigate = useNavigate();
  const config = useAppConfig();

  const { isMobileScreen } = config;

  const chatStore = useChatStore();
  const { pathname: currentPath } = useLocation();

  useEffect(() => {
    setShowPanel?.(currentPath === Path.Chat);
  }, [currentPath]);

  const onDragEnd: OnDragEndResponder = (result) => {
    const { destination, source } = result;
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    moveSession(source.index, destination.index);
  };

  function addBookmark(url: string, title: string) {
    if (window.sidebar && window.sidebar.addPanel) {
      // Firefox before version 23
      window.sidebar.addPanel(title, url, "");
    } else if (
      (window as any).external &&
      (window as any).external.AddFavorite
    ) {
      // IE Favorite
      (window as any).external.AddFavorite(url, title);
    } else {
      // Other browsers (mainly WebKit - Chrome/Safari)
      alert(
        "Press " +
          (navigator.userAgent.toLowerCase().indexOf("mac") !== -1
            ? "Cmd"
            : "Ctrl") +
          " + D to bookmark this page.",
      );
    }
  }

  return (
    <div
      className={`
      h-[100%] flex flex-col
      md:px-0
    `}
    >
      <div data-tauri-drag-region>
        <div
          className={`
            flex items-center justify-between
            py-6 max-md:box-content max-md:h-0
            md:py-7
          `}
          data-tauri-drag-region
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div className={styles["sidebar-title"]} data-tauri-drag-region>
              <a
                href="https://freetimeai.eu.org"
                style={{ color: "#007bff", fontWeight: "bold" }}
              >
                FreeTimeAI
              </a>
            </div>
            <div className={styles["sidebar-sub-title"]}>
              <div>
                <a
                  href="https://freetimeai.eu.org/business.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#007bff", fontWeight: "bold" }}
                >
                  商业化直达
                </a>
                <br />
                <a
                  href="https://autoaigpt.eu.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#007bff", fontWeight: "bold" }}
                  onClick={() =>
                    addBookmark(
                      "https://autoaigpt.eu.org/",
                      "FreeTimeAI - 收藏",
                    )
                  }
                >
                  防失联收藏
                </a>
              </div>
            </div>
          </div>

          <div
            className=" cursor-pointer"
            onClick={() => {
              if (config.dontShowMaskSplashScreen) {
                chatStore.newSession();
                navigate(Path.Chat);
              } else {
                navigate(Path.NewChat);
              }
            }}
          >
            <AddIcon />
          </div>
        </div>
        <div
          className={`pb-3 text-sm sm:text-sm-mobile text-text-chat-header-subtitle`}
          style={{
            paddingTop: "5px",
            paddingBottom: "5px",
            marginBottom: "-40px",
          }} // 调整这些值以达到你想要的效果
        ></div>
      </div>

      <div className={`flex-1 overflow-y-auto max-md:pb-chat-panel-mobile `}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="chat-list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`w-[100%]`}
              >
                {sessions.map((item, i) => (
                  <SessionItem
                    title={item.topic}
                    time={new Date(item.lastUpdate).toLocaleString()}
                    count={item.messages.length}
                    key={item.id}
                    id={item.id}
                    index={i}
                    selected={i === selectedIndex}
                    onClick={() => {
                      navigate(Path.Chat);
                      selectSession(i);
                    }}
                    onDelete={async () => {
                      if (
                        await Modal.warn({
                          okText: Locale.ChatItem.DeleteOkBtn,
                          cancelText: Locale.ChatItem.DeleteCancelBtn,
                          title: Locale.ChatItem.DeleteTitle,
                          content: Locale.ChatItem.DeleteContent,
                        })
                      ) {
                        chatStore.deleteSession(i);
                      }
                    }}
                    mask={item.mask}
                    isMobileScreen={isMobileScreen}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}, Panel);
