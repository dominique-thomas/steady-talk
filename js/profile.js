/**
 * Project: Steady Talk
 * Description: Dynamically loads industry-specific content for mock interview company profile page.
 * Author: Dominique Thomas (github.com/dominique-thomas)
 * License: Shared publicly for demonstration purposes only. Reuse or redistribution not permitted without permission.
 */
//----------------------------------
//  Global Variables
//----------------------------------
const params = new URLSearchParams(window.location.search);
const type = params.get("type") || "it";
const company = companyData[type] || companyData.it;
const teamContainer = document.getElementById("team-container");
const valuesContainer = document.getElementById("values-container");
const topBtn = document.querySelector(".back-to-top");

// Set specified company data
document.title = company.name;
document.getElementById("company-name").textContent = company.name;
document.getElementById("tagline").textContent = company.tagline;
document.getElementById("info").textContent = company.about;
document.getElementById("unique").textContent = company.unique;
document.getElementById("header-img").src = "images/" + company.image;

// Set the company's description information
valuesContainer.innerHTML = "";
company.values.forEach((valueObj) => {
    const list = document.createElement("ul");
    list.innerHTML = `<li><strong>${valueObj.label}:</strong> <span class="has-grey-text">${valueObj.description}</span></li>`;
    valuesContainer.appendChild(list);
});

// Set the team members' data (title, image, etc.)
teamContainer.innerHTML = "";
company.team.forEach(member => {
  
    const firstName = member.name.split(" ")[0].toLowerCase();
    const imageSrc = `images/avatar_${firstName}.png`;
    const column = document.createElement("div");

    column.className = "column is-one-quarter";
    column.innerHTML = `
      <div class="card">
        <div class="card-content has-text-centered">
          <figure class="is-inline-block mb-3">
            <img src="${imageSrc}" alt="${member.name}" title="${member.name}">
          </figure>
          <p class="title is-5 mb-2">${member.name}</p>
          <p class="subtitle is-6 mb-1">${member.role}</p>
          <p class="is-size-7 has-text-grey">${member.bio}</p>
        </div>
      </div>
    `;

    teamContainer.appendChild(column);
});

// Set the contact information
document.getElementById("contact-email").textContent = company.email;
document.getElementById("contact-phone").textContent = company.phone;
document.getElementById("contact-hours").textContent = company.hours;
document.getElementById("footer-company-name").textContent = company.name;

// Update the year dynamically and add event listener to go to the top of the page
document.getElementById("year").textContent = new Date().getFullYear();
window.addEventListener("scroll", () => {
    topBtn.style.display = window.scrollY > 300 ? "flex" : "none";
});