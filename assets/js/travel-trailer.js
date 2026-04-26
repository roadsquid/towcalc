function byId(id) {
  return document.getElementById(id);
}

function num(id) {
  return Number(byId(id).value) || 0;
}

function formatLbs(value) {
  const rounded = Math.round(value);
  const formatted = Math.abs(rounded).toLocaleString();
  return `${rounded < 0 ? "-" : ""}${formatted} lbs`;
}

function updateCalculator() {
  const payload = num("payload");
  const towRating = num("towRating");
  const trailerWeight = num("trailerWeight");
  const tonguePercent = num("tonguePercent");
  const hitchWeight = num("hitchWeight");
  const passengerWeight = num("passengerWeight");
  const cargoWeight = num("cargoWeight");
  const safetyMargin = num("safetyMargin");

  const adjustedPayloadLimit = payload * (1 - safetyMargin / 100);
  const adjustedTowLimit = towRating * (1 - safetyMargin / 100);

  const estimatedTongueWeight = trailerWeight * (tonguePercent / 100);
  const payloadLeftForTongue = adjustedPayloadLimit - hitchWeight - passengerWeight - cargoWeight;
  const payloadDifference = payloadLeftForTongue - estimatedTongueWeight;
  const towDifference = adjustedTowLimit - trailerWeight;

  byId("tongueWeightResult").textContent = formatLbs(estimatedTongueWeight);
  byId("payloadLeftResult").textContent = formatLbs(payloadLeftForTongue);
  byId("payloadDiffResult").textContent = payloadDifference >= 0
    ? `+${formatLbs(payloadDifference)}`
    : formatLbs(payloadDifference);
  byId("towDiffResult").textContent = towDifference >= 0
    ? `+${formatLbs(towDifference)}`
    : formatLbs(towDifference);

  const statusBadge = byId("statusBadge");
  const resultHeadline = byId("resultHeadline");
  const summaryText = byId("summaryText");
  const constraintLabel = byId("constraintLabel");
  const constraintText = byId("constraintText");

  const payloadTight = payloadDifference >= 0 && payloadDifference < 300;
  const towTight = towDifference >= 0 && towDifference < 500;

  let statusClass = "status-good";
  let statusText = "Pass";
  let headline = "Looks workable";
  let summary = "Your numbers look workable with the safety margin included.";
  let limiter = "What is limiting you";
  let limiterText = payloadDifference <= towDifference
    ? "Payload appears to be the tighter limit on this setup."
    : "Tow rating appears to be the tighter limit on this setup.";

  if (payloadDifference < 0 || towDifference < 0) {
    statusClass = "status-bad";
    statusText = "No-go";
    headline = "Over the line";

    if (payloadDifference < 0 && towDifference < 0) {
      summary = "This setup appears over both your adjusted payload and tow rating limits.";
      limiterText = "Both payload and tow rating appear to be exceeded based on the numbers entered.";
    } else if (payloadDifference < 0) {
      summary = "This setup appears too heavy for your available payload.";
      limiterText = "Payload is the main problem. Your estimated tongue weight is using more than your adjusted payload allows.";
    } else {
      summary = "This setup appears too heavy for your adjusted tow rating.";
      limiterText = "Tow rating is the main problem. The trailer weight exceeds your adjusted tow limit.";
    }
  } else if (payloadTight || towTight) {
    statusClass = "status-warn";
    statusText = "Borderline";
    headline = "Close call";

    if (payloadDifference <= towDifference) {
      summary = "This setup is close to the edge. Payload appears to be the tighter constraint.";
      limiterText = "Payload is getting tight. A little more cargo, passengers, hitch hardware, or real-world tongue weight could push this setup over the line.";
    } else {
      summary = "This setup is close to the edge. Tow rating appears to be the tighter constraint.";
      limiterText = "Tow rating is getting tight. You do not have much room left once the safety margin is applied.";
    }
  }

  statusBadge.className = `result-status ${statusClass}`;
  statusBadge.textContent = statusText;
  resultHeadline.textContent = headline;
  summaryText.textContent = summary;
  constraintLabel.textContent = limiter;
  constraintText.textContent = limiterText;
}

document.addEventListener("DOMContentLoaded", function () {
  const inputs = document.querySelectorAll("input");

  inputs.forEach((input) => {
    input.addEventListener("input", updateCalculator);
  });

  updateCalculator();
});