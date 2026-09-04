const PROJECTS = {
  "multi-agent-onboarding": {
    monogram: "MA",
    title: "Multi-Agent Employee Onboarding Assistant",
    tech: "Gemini 2.0 Flash · Streamlit",
    problem: "New hires need tool access, a ramp-up plan, and answers to handbook questions — without waiting on a human.",
    approach: "Three collaborating agents provision tool access, generate a 30-60-90 day learning plan, and answer HR questions grounded in the company handbook. A JSON-first, LLM-second provisioning agent resolves tools and contacts deterministically before prompting the model.",
    result: "Eliminated hallucinated tools and fake contact details. Architected as a layered, testable codebase using the model's 1M-token context to inject full handbooks without a vector database.",
    repo: null
  },
  "gamesphere": {
    monogram: "GS",
    title: "GameSphere: SQL Analytics for Gamers",
    tech: "SQL",
    problem: "A gaming platform needed structured player data and clear engagement/retention insight drawn from it.",
    approach: "Designed a relational SQL database with 4 tables and wrote 30+ queries to generate player engagement and retention insights.",
    result: "Applied data validation and query optimization to maintain data integrity and improve query performance.",
    repo: null
  },
  "tweet-emotion": {
    monogram: "TE",
    title: "Tweet Emotion Recognition",
    tech: "TensorFlow · Python · LSTM",
    problem: "Classify the emotion behind a tweet — anger, fear, joy, sadness, surprise, or love — from raw, noisy text.",
    approach: "Built a deep learning pipeline in TensorFlow/Keras: tokenized and padded tweet text, then trained an embedding + LSTM network to capture sequential context ahead of a dense classification head.",
    result: "Evaluated the model on accuracy and loss across all six emotion classes and validated predictions on unseen tweets — a guided Coursera project extended with my own preprocessing and tuning choices.",
    repo: "https://github.com/Karan-Naik-08/Tweet-Emotion-Recognition"
  },
  "easy-finance": {
    monogram: "EF",
    title: "Easy Finance",
    tech: "Python · Machine Learning · Flask · Chart.js",
    problem: "People setting a financial goal (a car, a house, a business) have no easy way to translate income, expenses, and savings into a concrete, personalized plan.",
    approach: "Built a financial management platform: ML models predict car and house prices from user inputs, and a rules layer turns salary, essential expenses, and goals into a tailored budget plan. A Chart.js dashboard surfaces real-time income/expense and savings-progress metrics.",
    result: "Final year major engineering project — shipped an end-to-end system from prediction models to an interactive financial dashboard.",
    repo: "https://github.com/Karan-Naik-08/Easy-Finance"
  },
  "smart-parking": {
    monogram: "SP",
    title: "Smart Parking Using YOLOv5",
    tech: "YOLOv5 · Python · Computer Vision",
    problem: "Drivers waste time searching for open spots because parking lots have no automated way to report space availability.",
    approach: "Trained a custom YOLOv5 object-detection model on a parking-lot dataset to identify occupied vs. empty spaces in real time, with a custom data config for the target lot layout.",
    result: "Model reliably flags available spaces from camera input, laying the groundwork for a live occupancy feed.",
    repo: "https://github.com/Karan-Naik-08/Smart_Parking-Using_Yolov5"
  },
  "myloc-amenities": {
    monogram: "ML",
    title: "MyLoc Amenities Finder",
    tech: "Python · Flask · KMeans · JavaScript",
    problem: "Finding nearby amenities is easy; telling good ones from bad ones at a glance is not.",
    approach: "Built a Flask web app that clusters nearby amenities with KMeans and renders them with a color-coding scheme — hue by category, shade by user rating — so quality and type read instantly on the map.",
    result: "Mini project for third year engineering — delivered a working clustering and visualization pipeline end to end.",
    repo: "https://github.com/Karan-Naik-08/MyLoc-Amenities-Finder"
  },
  "mmrda-internship": {
    monogram: "DS",
    title: "MMRDA Data Analysis Internship",
    tech: "Python · scikit-learn · EDA",
    problem: "A 2-week internship at the Mumbai Metropolitan Region Development Authority (MMRDA) needed hands-on proof of exploratory data analysis and baseline ML across varied datasets.",
    approach: "Ran EDA and built baseline models — regression (house prices), classification (income, survival, wine quality, activity recognition) — across 10 public datasets including Titanic, Boston Housing, and Census Income.",
    result: "Case study across 10 datasets, applying linear/decision-tree regression and logistic regression, KNN, decision trees, and random forest classification as appropriate to each problem.",
    repo: "https://github.com/Karan-Naik-08/Data-Science_Internship-Vcet"
  }
};

const modal = document.getElementById("project-modal");
if (modal) {
  document.querySelectorAll(".project-card[data-project]").forEach((card) => {
    card.addEventListener("click", () => {
      const project = PROJECTS[card.dataset.project];
      if (!project) return;

      document.getElementById("modal-monogram").textContent = project.monogram;
      document.getElementById("modal-title").textContent = project.title;
      document.getElementById("modal-tech").textContent = project.tech;
      document.getElementById("modal-problem").textContent = project.problem;
      document.getElementById("modal-approach").textContent = project.approach;
      document.getElementById("modal-result").textContent = project.result;

      const repoLink = document.getElementById("modal-repo-link");
      if (project.repo) {
        repoLink.href = project.repo;
        repoLink.style.display = "inline-flex";
      } else {
        repoLink.style.display = "none";
      }

      modal.showModal();
    });
  });

  modal.querySelector(".modal-close").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });
}
