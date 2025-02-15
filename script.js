document.addEventListener("DOMContentLoaded", function () {
    const pdfList = document.getElementById("pdfList");
    const questionInput = document.getElementById("question");
    const answerBox = document.getElementById("answer");
    const searchButton = document.getElementById("searchButton");
    const loader = document.getElementById("loadingSpinner");

    searchButton.addEventListener("click", function () {
        const selectedPdf = pdfList.value;
        if (!selectedPdf) {
            alert("Please select a PDF");
            return;
        }

        answerBox.textContent = "Please wait...";
        loader.style.display = "block";
        const pdfPath = `https://raw.githubusercontent.com/kingkuan001/KuanJoe-Learn/main/${selectedPdf}`;
        extractTextFromPDF(pdfPath);
    });

    async function extractTextFromPDF(pdfPath) {
        try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
            const loadingTask = pdfjsLib.getDocument(pdfPath);
            const pdf = await loadingTask.promise;

            let textContent = "";
            const pagePromises = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                pagePromises.push(pdf.getPage(i).then(page =>
                    page.getTextContent().then(content =>
                        content.items.map(item => item.str).join(" ")
                    )
                ));
            }

            const pageTexts = await Promise.all(pagePromises);
            textContent = pageTexts.join(" ");
            searchAnswer(textContent);
        } catch (error) {
            console.error("Error loading or processing PDF:", error);
            answerBox.textContent = "Error loading the document. Make sure the file exists and try again.";
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

        const sentences = textContent.split(/\.|\n/);
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
