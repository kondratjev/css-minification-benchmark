import picocolors from "picocolors";

const formats = {
  time: "time",
  size: "byte",
  gzip: "byte",
};

const styled = (
  asHTML: boolean,
  value: any,
  color: any,
  bootstrapClass: string
) => {
  return asHTML ? { class: bootstrapClass, value } : picocolors[color](value);
};

const formatValue = (asHTML: boolean, result: any, key: string) => {
  const value = result.value.format(key, formats[key]);
  let valueStyled = value;

  if (result.compare[key].worst) {
    valueStyled = styled(asHTML, value, "red", "danger");
  }

  if (result.compare[key].best) {
    valueStyled = styled(asHTML, value, "green", "success");
  }

  if (asHTML) {
    if (typeof valueStyled == "string") {
      valueStyled = { value: valueStyled };
    }
    valueStyled.differential = result.compare[key].differential;
    if (formats[key] === "byte") {
      const percent = (
        (result.value[key] / result.value["original" + key]) *
        100
      ).toFixed(1);
      valueStyled.value += ` (${percent}%)`;
    }
  }

  return valueStyled;
};

const formatPercentages = (value: number) => {
  if (Number.isNaN(value)) {
    return "";
  }

  if (value === 0) {
    return "baseline";
  }

  const sign = value > 0 ? "+" : "-";
  return sign + value + "%";
};

const formatRow = (
  asHTML: boolean,
  result: { value: { isValid: () => any; label: any } },
  gzip: any
) => {
  if (!result.value.isValid()) {
    return styled(asHTML, result.value.label, "red", "danger");
  }

  if (typeof result === "string") {
    return result;
  }

  let valueStyled;
  let formatted = asHTML ? {} : "";

  const sizeKey = gzip ? "gzip" : "size";
  valueStyled = formatValue(asHTML, result, sizeKey);

  if (asHTML) {
    formatted.size = valueStyled.value || valueStyled;
    formatted.sizeClass = valueStyled.class || "secondary";
  } else {
    formatted = valueStyled;
  }

  valueStyled = formatValue(asHTML, result, "time");

  if (asHTML) {
    formatted.time = valueStyled.value || valueStyled;
    formatted.timeClass = valueStyled.class || "secondary";
    formatted.differential = formatPercentages(valueStyled.differential);
  } else {
    formatted += ` - ${valueStyled}`;
  }

  return formatted;
};

export default formatRow;
