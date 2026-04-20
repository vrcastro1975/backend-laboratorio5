const searchForm = document.getElementById("search-form");
const listingResults = document.getElementById("listing-results");
const paginationInfo = document.getElementById("pagination-info");
const listingDetail = document.getElementById("listing-detail");
const reviewForm = document.getElementById("review-form");
const reviewResponse = document.getElementById("review-response");
const reviewListingIdInput = document.getElementById("review-listing-id");
const updateListingIdInput = document.getElementById("update-listing-id");
const updateForm = document.getElementById("update-listing-form");
const updateResponse = document.getElementById("update-response");
const loginForm = document.getElementById("login-form");
const logoutButton = document.getElementById("logout-button");
const authStatus = document.getElementById("auth-status");
const appSections = document.getElementById("app-sections");
const loginPasswordInput = document.getElementById("login-password");

let authToken = null;
let authRole = null;

const refreshAuthStatus = () => {
  if (!authToken) {
    authStatus.textContent = "Sin sesión activa.";
    appSections.classList.add("hidden");
    return;
  }

  authStatus.textContent = `Sesión activa como ${
    authRole === "admin" ? "administrador" : "usuario"
  }.`;
  appSections.classList.remove("hidden");
};

const renderListings = (payload) => {
  paginationInfo.textContent = `Página ${payload.pagination.page} de ${payload.pagination.totalPages}. Total: ${payload.pagination.total}`;

  listingResults.innerHTML = payload.items
    .map(
      (item) => `
        <li class="listing-item">
          <strong>${item.name}</strong>
          <p>${item.summary || ""}</p>
          <button data-id="${item.id}" class="btn-detail">Ver detalle</button>
        </li>
      `
    )
    .join("");

  document.querySelectorAll(".btn-detail").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.getAttribute("data-id");
      reviewListingIdInput.value = id;
      updateListingIdInput.value = id;
      await loadListingDetail(id);
    });
  });
};

const loadListingDetail = async (id) => {
  const response = await fetch(`/api/listings/${id}`);
  const payload = await response.json();

  if (!response.ok) {
    listingDetail.innerHTML = `<p>Error: ${payload.message ?? "No disponible"}</p>`;
    return;
  }

  listingDetail.innerHTML = `
    <h3>${payload.name}</h3>
    <p><strong>Dirección:</strong> ${payload.address}</p>
    <p><strong>Camas:</strong> ${payload.beds} | <strong>Baños:</strong> ${payload.bathrooms}</p>
    <p>${payload.description || ""}</p>
    <h4>Últimas reseñas</h4>
    <ul>
      ${
        payload.latestReviews.length
          ? payload.latestReviews
              .map(
                (review) =>
                  `<li><strong>${review.name}</strong> (${new Date(
                    review.date
                  ).toLocaleString()}): ${review.comments}</li>`
              )
              .join("")
          : "<li>Sin reseñas</li>"
      }
    </ul>
  `;
};

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const country = document.getElementById("country").value.trim();
  const page = document.getElementById("page").value || "1";
  const pageSize = document.getElementById("page-size").value || "5";

  const query = new URLSearchParams({
    page,
    pageSize,
  });
  if (country) {
    query.set("country", country);
  }

  const response = await fetch(`/api/listings?${query.toString()}`);
  const payload = await response.json();
  renderListings(payload);
});

reviewForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const listingId = reviewListingIdInput.value.trim();
  const name = document.getElementById("review-name").value.trim();
  const comments = document.getElementById("review-comments").value.trim();

  const response = await fetch(`/api/listings/${listingId}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, comments }),
  });
  const payload = await response.json();

  reviewResponse.textContent = JSON.stringify(payload, null, 2);
  if (response.ok) {
    await loadListingDetail(listingId);
  }
});

updateForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const listingId = updateListingIdInput.value.trim();
  const description = document.getElementById("update-description").value.trim();
  const street = document.getElementById("update-street").value.trim();

  const payload = {};
  if (description) {
    payload.description = description;
  }
  if (street) {
    payload.address = { street };
  }

  const response = await fetch(`/api/listings/${listingId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const responsePayload = await response.json();
  updateResponse.textContent = JSON.stringify(responsePayload, null, 2);

  if (response.ok) {
    await loadListingDetail(listingId);
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();

  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  const payload = await response.json();

  if (!response.ok) {
    authToken = null;
    authRole = null;
    refreshAuthStatus();
    updateResponse.textContent = JSON.stringify(payload, null, 2);
    loginPasswordInput.value = "";
    return;
  }

  authToken = payload.token;
  authRole = payload.role;
  refreshAuthStatus();
  loginPasswordInput.value = "";
});

logoutButton.addEventListener("click", () => {
  authToken = null;
  authRole = null;
  refreshAuthStatus();
  loginPasswordInput.value = "";
});

refreshAuthStatus();
