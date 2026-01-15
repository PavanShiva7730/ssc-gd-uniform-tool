const fileInput = document.getElementById("photoInput");
const generateBtn = document.getElementById("generateBtn");
const resultImage = document.getElementById("resultImage");
const loader = document.getElementById("loader");
const downloadBtn = document.getElementById("downloadBtn");

// ✅ Your Cloudflare Worker URL
const WORKER_URL = "https://ssc-gd.medeti-prasad.workers.dev";

generateBtn.addEventListener("click", async () => {
  if (!fileInput.files.length) {
    alert("Please upload a photo first");
    return;
  }

  loader.classList.remove("hidden");
  resultImage.classList.add("hidden");
  downloadBtn.classList.add("hidden");

  const file = fileInput.files[0];

  const reader = new FileReader();

  reader.onload = async () => {
    try {
      const base64Image = reader.result;

      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image: base64Image,
          prompt:
            "Ultra realistic portrait photo of an Indian SSC GD Constable wearing official khaki uniform, realistic lighting, sharp focus, professional photography, high detail face, cinematic background"
        })
      });

      const data = await response.json();

      loader.classList.add("hidden");

      // ✅ FINAL FIX (IMPORTANT)
      if (data.output && data.output.length > 0) {
        const imageUrl = data.output[0];

        resultImage.src = imageUrl;
        resultImage.classList.remove("hidden");

        downloadBtn.href = imageUrl;
        downloadBtn.classList.remove("hidden");
      } else {
        console.error("Invalid response:", data);
        alert("Image generation failed");
      }
    } catch (error) {
      console.error("Error:", error);
      loader.classList.add("hidden");
      alert("Something went wrong. Please try again.");
    }
  };

  reader.readAsDataURL(file);
});
