import * as React from "react";
import styles from "./PowerVirtualAgentSpfx.module.scss";
import { IPowerVirtualAgentSpfxProps } from "./IPowerVirtualAgentSpfxProps";
import {
  createDirectLine,
  createStore,
  renderWebChat,
} from "botframework-webchat";
import { Dispatch, Action } from "redux";

export const PowerVirtualAgentSpfx: React.FC<IPowerVirtualAgentSpfxProps> = (
  props
) => {
  // Add styleOptions to customize the Web Chat canvas
  const styleOptions = {
    hideUploadButton: true,
    botAvatarInitials: "BT",
    accent: "#737373",
    botAvatarBackgroundColor: "#FFFFFF",
    botAvatarImage: "<Your URL to bot image>",
    userAvatarInitials: "US",
    userAvatarBackgroundColor: "#FFFFFF",
    userAvatarImage: "<Your URL to user image>",
  };

  //The url to your bot in the Power Virtual Agent Portal
  const theURL = "<Your bot URL>";

  const environmentEndPoint = theURL.slice(
    0,
    theURL.indexOf("/powervirtualagents")
  );

  const apiVersion = theURL.slice(theURL.indexOf("api-version")).split("=")[1];

  const regionalChannelSettingsURL = `${environmentEndPoint}/powervirtualagents/regionalchannelsettings?api-version=${apiVersion}`;

  const store = createStore(
    {},
    ({ dispatch }: { dispatch: Dispatch<Action> }) =>
      (next: Dispatch<Action>) =>
      (action: Action) => {
        if (action.type === "DIRECT_LINE/CONNECT_FULFILLED") {
          dispatch({
            meta: {
              method: "keyboard",
            },
            payload: {
              activity: {
                channelData: {
                  postBack: true,
                },
                name: "startConversation",
                type: "event",
              },
            },
            type: "DIRECT_LINE/POST_ACTIVITY",
          });
        }
        return next(action);
      }
  );

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  let directLine: any;

  fetch(regionalChannelSettingsURL)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      directLine = data.channelUrlsById.directline;

      // Fetch conversation information
      fetch(theURL)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch conversation information");
          }
          return response.json();
        })
        .then((conversationInfo) => {
          // Conversation info retrieved successfully, initializing the Web Chat
          renderWebChat(
            {
              directLine: createDirectLine({
                domain: `${directLine}v3/directline`,
                token: conversationInfo.token,
              }),
              store: store,
              styleOptions,
            },
            document.getElementById("webchat")
          );
        })
        .catch((err) => {
          console.error(
            "An error occurred while fetching conversation info: " + err
          );
        });
    })
    .catch((err) => {
      console.error("An error occurred while fetching direct line: " + err);
    });

  return (
    <section className={styles.center}>
      <div className={styles.botContainer}>
        <div className={styles.heading}>
          <h1 className={styles.headingTextBot}>Power Virtual Agent Bot</h1>
        </div>
        <div id="webchat" className={styles.webchat} role="main" />
      </div>
    </section>
  );
};
