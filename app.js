const fileInput = document.getElementById("photoInput");
const generateBtn = document.getElementById("generateBtn");
const resultImage = document.getElementById("resultImage");
const loader = document.getElementById("loader");
const downloadBtn = document.getElementById("downloadBtn");

const WORKER_URL = "https://ssc-gd.medeti-prasad.workers.dev";

generateBtn.addEventListener("click", async () => {
  if (!fileInput.files.length) {
    alert("Upload a photo first");
    return;
  }

  loader.classList.remove("hidden");
  resultImage.classList.add("hidden");
  downloadBtn.classList.add("hidden");

  const reader = new FileReader();

  reader.onload = async () => {
    const createRes = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: reader.result,
        prompt:
          "Ultra realistic Indian SSC GD Constable wearing khaki uniform, professional portrait, realistic face, high detail"
      })
    });

    const prediction = await createRes.json();

    const poll = async () => {
      const pollRes = await fetch(`${WORKER_URL}?id=${prediction.id}`);
      const data = await pollRes.json();

      if (data.status === "succeeded") {
        loader.classList.add("hidden");
        resultImage.src = data.output[0];
        resultImage.classList.remove("hidden");
        downloadBtn.href = data.output[0];
        downloadBtn.classList.remove("hidden");
      } else if (data.status === "failed") {
        loader.classList.add("hidden");
        alert("Image generation failed");
      } else {
        setTimeout(poll, 4000);
      }
    };

    poll();
  };

  reader.readAsDataURL(fileInput.files[0]);
});
