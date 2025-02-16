var scheduled_toots = [];
var pictures = [];

// after load the image, check if token and instanceURL in local storage, if not, show a dialog to input and save into the local storage
window.addEventListener("load", () => {
  const token = getToken();
  const instanceURL = getInstanceURL();
  if (!token || !instanceURL) {
    window.location.href = "config.html";
  }
}
);

function getToken() {
  let token = localStorage.getItem("token");
  if (!token) {
    showTips("Please input your access token", "error");
    return null;
  }
  return token;
}

function getInstanceURL() {
  let instanceURL = localStorage.getItem("instanceURL");
  if (!instanceURL) {
    showTips("Please input your instance URL", "error");
    return null;
  }
  return instanceURL;
}


function showTips(msg, type) {
  const tips = document.querySelector("#tips");
  tips.innerHTML = msg;
  tips.style.display = "block";
  tips.classList.add(`tips-${type}`);
  setTimeout(() => {
    tips.style.display = "none";
    tips.classList.remove(`tips-${type}`);
  }, 1000);
}

async function getAllScheduledToots() {
  const response = await fetch(
    "https://techhub.social/api/v1/scheduled_statuses",
    {
      headers: {
        Authorization:
          "Bearer " + getToken(),
      },
    }
  );
  scheduled_toots = await response.json();
}

function showScheduledToots() {
  const scheduledTootsList = document.querySelector("#scheduled-toots-list");
  scheduledTootsList.innerHTML = "";

  scheduled_toots.forEach((toot) => {
    console.log(toot);
    // get first line of toot content as title
    const title = toot.params.text.split("\n")[0];
    const tootElement = document.createElement("li");
    let details = document.createElement("details");
    let summary = document.createElement("summary");
    let span = document.createElement("span");
    let time_span = document.createElement("span");
    let alink = document.createElement("a");
    alink.href = "#";
    alink.classList.add("toot-delete-btn");
    alink.onclick = async (e) => {
      e.preventDefault();
      const response = await fetch(
        `https://techhub.social/api/v1/scheduled_statuses/${toot.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              "Bearer " + getToken(),
          },
        }
      );
      if (response.ok) {
        showTips("Toot deleted successfully!", "info");
        await getAllScheduledToots();
        showScheduledToots();
      } else {
        showTips("Failed to delete toot!", "error");
      }
    };
    let pre = document.createElement("pre");
    pre.style.textAlign = "left";
    alink.dataset.id = toot.id;
    alink.innerHTML = "Delete";
    span.innerHTML = title;
    let scheduled_at = new Date(toot.scheduled_at);
    time_span.innerHTML = "📅 " + `${scheduled_at.getFullYear()}-${scheduled_at.getMonth() + 1}-${scheduled_at.getDate()}`;
    pre.innerHTML = toot.params.text;
    summary.appendChild(time_span);
    summary.appendChild(span);
    summary.appendChild(alink);
    details.appendChild(summary);
    details.appendChild(pre);
    for (const media of toot.media_attachments) {
      const img = document.createElement("img");
      img.src = media.preview_url;
      img.style.width = "100px";
      details.appendChild(img);
    }
    tootElement.appendChild(details);
    scheduledTootsList.appendChild(tootElement);
  });
}

function showPictures() {
  const picturesList = document.querySelector("#image-preview");
  picturesList.innerHTML = "";
  pictures.forEach((picture) => {
    const img = document.createElement("img");
    img.src = picture.preview_url;
    picturesList.appendChild(img);
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  await getAllScheduledToots();
  showScheduledToots();

  // when paste image in textarea, get the image data and upload to mastodon media API
  document.querySelector("#toot-text").addEventListener("paste", async (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.kind === "file") {
        const blob = item.getAsFile();
        const formData = new FormData();
        formData.append("file", blob);
        const response = await fetch("https://techhub.social/api/v1/media", {
          method: "POST",
          headers: {
            Authorization:
              "Bearer " + getToken(),
          },
          body: formData,
        });
        if (response.ok) {
          const media = await response.json();
          pictures.push(media);
          showPictures();
        } else {
          console.error("upload picture failed");
        }
      }
    }
  });

  document.querySelector("#post-toot").addEventListener("click", async () => {
    const toot = document.querySelector("#toot-text").value;
    // get first line as title from toot text
    const title = toot.split("\n")[0];
    // get date from input element value
    const toottime = document.querySelector("#toot-time").value;
    // call mastodon API with a token, to post scheduled toot
    const response = await fetch("https://techhub.social/api/v1/statuses", {
      method: "POST",
      headers: {
        Authorization:
          "Bearer " + getToken(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: toot,
        scheduled_at: toottime,
        visibility: "public",
        media_ids: pictures.map((media) => media.id),
      }),
    });
    if (response.ok) {
      showTips("Toot scheduled successfully!", "info");
      pictures = [];
      showPictures();
      document.querySelector("#toot-text").value = "";
      await getAllScheduledToots();
      showScheduledToots();
    } else {
      showTips("Failed to schedule toot!", "error");
    }
  });
});
