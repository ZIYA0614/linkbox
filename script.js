
const STORAGE_SITES_KEY = "linkboxSites";
const STORAGE_FAVORITES_KEY = "linkboxFavorites";

const categoryNames = {
  dev: "개발",
  cloud: "클라우드",
  learning: "학습",
  career: "취업",
  work: "업무",
  life: "생활",
  other: "기타"
};

// 기본으로 제공되는 추천 사이트
const recommendedSites = [
  {
    id: "github",
    name: "GitHub",
    url: "https://github.com",
    description: "소스 코드 저장 및 협업을 위한 개발 플랫폼",
    category: "dev"
  },
  {
    id: "aws",
    name: "AWS",
    url: "https://aws.amazon.com",
    description: "클라우드 컴퓨팅 서비스와 다양한 기술 자료",
    category: "cloud"
  },
  {
    id: "google-cloud",
    name: "Google Cloud",
    url: "https://cloud.google.com",
    description: "구글의 클라우드 컴퓨팅 플랫폼",
    category: "cloud"
  },
  {
    id: "inflearn",
    name: "인프런",
    url: "https://www.inflearn.com",
    description: "개발과 IT 기술을 배울 수 있는 온라인 강의",
    category: "learning"
  },
  {
    id: "opentutorials",
    name: "생활코딩",
    url: "https://opentutorials.org",
    description: "웹과 프로그래밍을 쉽게 배울 수 있는 교육 사이트",
    category: "learning"
  },
  {
    id: "saramin",
    name: "사람인",
    url: "https://www.saramin.co.kr",
    description: "채용 공고와 취업 정보를 확인할 수 있는 사이트",
    category: "career"
  },
  {
    id: "notion",
    name: "Notion",
    url: "https://www.notion.so",
    description: "메모, 일정, 문서 등을 관리하는 생산성 도구",
    category: "work"
  },
  {
    id: "google-drive",
    name: "Google Drive",
    url: "https://drive.google.com",
    description: "파일 저장과 문서 공유를 위한 클라우드 서비스",
    category: "work"
  }
];

// 저장된 사용자 사이트 불러오기
function loadArray(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

let userSites = loadArray(STORAGE_SITES_KEY);
const favorites = new Set(loadArray(STORAGE_FAVORITES_KEY));

let selectedView = "all";
let selectedCategory = "all";
let editingId = null;

// HTML 요소 가져오기
const sitesGrid = document.getElementById("sitesGrid");
const searchInput = document.getElementById("searchInput");
const resultsCount = document.getElementById("resultsCount");
const emptyState = document.getElementById("emptyState");

const addSiteButton = document.getElementById("addSiteButton");
const formSection = document.getElementById("formSection");
const siteForm = document.getElementById("siteForm");
const formTitle = document.getElementById("formTitle");

const siteNameInput = document.getElementById("siteName");
const siteUrlInput = document.getElementById("siteUrl");
const siteDescriptionInput = document.getElementById("siteDescription");
const siteCategoryInput = document.getElementById("siteCategory");

const closeFormButton = document.getElementById("closeFormButton");
const cancelButton = document.getElementById("cancelButton");

// 사이트 주소 자동 완성
function normalizeUrl(input) {
  let value = input.trim();

  if (!/^https?:\/\//i.test(value)) {
    value = "https://" + value;
  }

  const parsedUrl = new URL(value);

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("http 또는 https 주소만 사용할 수 있습니다.");
  }

  if (!parsedUrl.hostname.includes(".")) {
    throw new Error("올바른 사이트 주소를 입력해 주세요.");
  }

  return parsedUrl.href;
}

// 사이트 목록 저장
function saveUserSites() {
  localStorage.setItem(STORAGE_SITES_KEY, JSON.stringify(userSites));
}

// 즐겨찾기 저장
function saveFavorites() {
  localStorage.setItem(
    STORAGE_FAVORITES_KEY,
    JSON.stringify([...favorites])
  );
}

// 사이트 등록 폼 열기
function openForm(site = null) {
  editingId = site ? site.id : null;

  formTitle.textContent = site ? "사이트 수정" : "나만의 사이트 등록";

  siteNameInput.value = site ? site.name : "";
  siteUrlInput.value = site ? site.url : "";
  siteDescriptionInput.value = site ? site.description : "";
  siteCategoryInput.value = site ? site.category : "dev";

  formSection.hidden = false;
  formSection.scrollIntoView({ behavior: "smooth", block: "center" });

  siteNameInput.focus();
}

// 사이트 등록 폼 닫기
function closeForm() {
  formSection.hidden = true;
  siteForm.reset();
  editingId = null;
}

// 사이트 카드 만들기
function createSiteCard(site) {
  const card = document.createElement("article");
  card.className = "site-card";

  const cardTop = document.createElement("div");
  cardTop.className = "card-top";

  const name = document.createElement("h3");
  name.textContent = site.name;

  const favoriteButton = document.createElement("button");
  favoriteButton.type = "button";
  favoriteButton.className = "favorite-button";
  favoriteButton.textContent = favorites.has(site.id) ? "★" : "☆";
  favoriteButton.title = "즐겨찾기";
  favoriteButton.setAttribute("aria-label", "즐겨찾기");

  if (favorites.has(site.id)) {
    favoriteButton.classList.add("is-favorite");
  }

  favoriteButton.addEventListener("click", () => {
    toggleFavorite(site.id);
  });

  cardTop.append(name, favoriteButton);

  const description = document.createElement("p");
  description.className = "site-description";
  description.textContent = site.description || "등록된 사이트입니다.";

  const url = document.createElement("a");
  url.className = "site-url";
  url.href = site.url;
  url.target = "_blank";
  url.rel = "noopener noreferrer";
  url.textContent = site.url;

  const cardBottom = document.createElement("div");
  cardBottom.className = "card-bottom";

  const category = document.createElement("span");
  category.className = "category-tag";
  category.textContent = categoryNames[site.category] || "기타";

  cardBottom.appendChild(category);

  // 직접 등록한 사이트에만 수정 및 삭제 버튼 표시
  const isMySite = userSites.some(item => item.id === site.id);

  if (isMySite) {
    const actions = document.createElement("div");
    actions.className = "card-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "card-action";
    editButton.textContent = "수정";
    editButton.addEventListener("click", () => {
      openForm(site);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "card-action delete";
    deleteButton.textContent = "삭제";
    deleteButton.addEventListener("click", () => {
      deleteSite(site.id);
    });

    actions.append(editButton, deleteButton);
    cardBottom.appendChild(actions);
  }

  card.append(cardTop, description, url, cardBottom);

  return card;
}

// 사이트 목록 화면에 표시
function renderSites() {
  const allSites = [...recommendedSites, ...userSites];

  let filteredSites = allSites;

  // 전체 / 즐겨찾기 / 내 사이트 필터
  if (selectedView === "favorites") {
    filteredSites = filteredSites.filter(site =>
      favorites.has(site.id)
    );
  }

  if (selectedView === "mine") {
    filteredSites = filteredSites.filter(site =>
      userSites.some(mySite => mySite.id === site.id)
    );
  }

  // 카테고리 필터
  if (selectedCategory !== "all") {
    filteredSites = filteredSites.filter(site =>
      site.category === selectedCategory
    );
  }

  // 검색
  const keyword = searchInput.value.trim().toLowerCase();

  if (keyword) {
    filteredSites = filteredSites.filter(site => {
      const category = categoryNames[site.category] || "";

      return (
        site.name.toLowerCase().includes(keyword) ||
        site.description.toLowerCase().includes(keyword) ||
        category.toLowerCase().includes(keyword)
      );
    });
  }

  sitesGrid.replaceChildren();

  filteredSites.forEach(site => {
    sitesGrid.appendChild(createSiteCard(site));
  });

  resultsCount.textContent = `총 ${filteredSites.length}개 사이트`;

  emptyState.hidden = filteredSites.length !== 0;
  sitesGrid.hidden = filteredSites.length === 0;
}

// 즐겨찾기 추가 / 해제
function toggleFavorite(id) {
  if (favorites.has(id)) {
    favorites.delete(id);
  } else {
    favorites.add(id);
  }

  saveFavorites();
  renderSites();
}

// 사이트 삭제
function deleteSite(id) {
  const confirmed = confirm("이 사이트를 삭제할까요?");

  if (!confirmed) {
    return;
  }

  userSites = userSites.filter(site => site.id !== id);
  favorites.delete(id);

  saveUserSites();
  saveFavorites();
  renderSites();
}

// 사이트 추가 버튼
addSiteButton.addEventListener("click", () => {
  openForm();
});

// 폼 닫기 버튼
closeFormButton.addEventListener("click", closeForm);
cancelButton.addEventListener("click", closeForm);

// 사이트 등록 / 수정
siteForm.addEventListener("submit", event => {
  event.preventDefault();

  const name = siteNameInput.value.trim();
  const address = siteUrlInput.value.trim();
  const description = siteDescriptionInput.value.trim();
  const category = siteCategoryInput.value;

  if (!name || !address) {
    alert("사이트 이름과 주소를 입력해 주세요.");
    return;
  }

  let normalizedUrl;

  try {
    normalizedUrl = normalizeUrl(address);
  } catch (error) {
    alert(error.message || "올바른 사이트 주소를 입력해 주세요.");
    return;
  }

  // 중복 주소 확인
  const allSites = [...recommendedSites, ...userSites];

  const duplicated = allSites.some(site => {
    if (site.id === editingId) {
      return false;
    }

    try {
      return normalizeUrl(site.url) === normalizedUrl;
    } catch (error) {
      return false;
    }
  });

  if (duplicated) {
    alert("이미 등록된 사이트 주소입니다.");
    return;
  }

  if (editingId) {
    userSites = userSites.map(site => {
      if (site.id !== editingId) {
        return site;
      }

      return {
        ...site,
        name,
        url: normalizedUrl,
        description,
        category
      };
    });
  } else {
    const newSite = {
      id: "custom-" + Date.now() + "-" + Math.random().toString(16).slice(2),
      name,
      url: normalizedUrl,
      description,
      category
    };

    userSites.push(newSite);
  }

  try {
    saveUserSites();
  } catch (error) {
    alert("저장에 실패했습니다. 브라우저 저장 공간을 확인해 주세요.");
    return;
  }

  closeForm();

  // 등록 또는 수정 후 내 사이트 화면으로 이동
  selectedView = "mine";
  selectedCategory = "all";
  searchInput.value = "";

  renderSites();
});

// 전체 / 즐겨찾기 / 내 사이트 버튼
document.querySelectorAll("[data-view]").forEach(button => {
  button.addEventListener("click", () => {
    selectedView = button.dataset.view;

    document.querySelectorAll("[data-view]").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    renderSites();
  });
});

// 카테고리 버튼
document.querySelectorAll("[data-category]").forEach(button => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category;

    document.querySelectorAll("[data-category]").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    renderSites();
  });
});

// 검색 입력
searchInput.addEventListener("input", renderSites);

// 처음 화면 표시
renderSites();
