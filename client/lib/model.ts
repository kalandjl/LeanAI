
  // Convert image file to base64 data URI
  const fileToDataUri = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
});

export const predictImage = async (img: File) => {

    try {
      const imgData = await fileToDataUri(img);

      const response = await fetch(
        "https://7a9f-2604-3d08-977a-a700-ddd8-a1f7-123c-7436.ngrok-free.app",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: [imgData],
          }),
        }
      );

      const json = await response.json();
      return json
    } catch (error) {
      alert("Error during prediction: " + error);
    } 
}