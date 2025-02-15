document.addEventListener("DOMContentLoaded", function () {
    const pdfList = document.getElementById("pdfList");
    const questionInput = document.getElementById("question");
    const answerBox = document.getElementById("answer");
    const searchButton = document.getElementById("searchButton");
    const loader = document.getElementById("loadingSpinner");
    const textCache = {};

    pdfList.addEventListener("change", function () {
        const selectedPdf = pdfList.value;
        if (selectedPdf && !textCache[selectedPdf]) {
            searchButton.disabled = true;
            const pdfPath = `https://raw.githubusercontent.com/kingkuan001/KuanJoe-Learn/main/${selectedPdf}`;
            preloadPDFText(selectedPdf, pdfPath);
        }
    });

    searchButton.addEventListener("click", function () {
        const selectedPdf = pdfList.value;
        if (!selectedPdf) {
            alert("Please select a PDF");
            return;
        }
        if (!textCache[selectedPdf]) {
            alert("Please wait for the document to load.");
            return;
        }
        searchAnswer(textCache[selectedPdf]);
    });

    async function preloadPDFText(pdfName, pdfPath) {
        loader.style.display = "block";
        try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
            const loadingTask = pdfjsLib.getDocument(pdfPath);
            const pdf = await loadingTask.promise;

            let textContent = "";
            const pagePromises = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                pagePromises.push(
                    pdf.getPage(i).then(async page => {
                        const content = await page.getTextContent();
                        return content.items.map(item => item.str).join(" ");
                    })
                );
            }

            const pageTexts = await Promise.all(pagePromises);
            textContent = pageTexts.join(" ");
            textCache[pdfName] = textContent;
            searchButton.disabled = false;
        } catch (error) {
            console.error("Error loading or processing PDF:", error);
        } finally {
            loader.style.display = "none";
        }
    }

    function searchAnswer(textContent) {
        const query = questionInput.value.trim().toLowerCase();
        if (!query) {
            alert("Please enter a question");
            return;
        }

        const sentences = textContent.split(/(?<=[.!?])\s+/);
        let bestMatch = "No relevant answer found.";

        for (let sentence of sentences) {
            if (sentence.toLowerCase().includes(query)) {
                bestMatch = sentence.trim();
                break;
            }
        }

        answerBox.textContent = bestMatch;
    }
});
