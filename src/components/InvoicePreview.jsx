import React from "react";
import ClassicTemplate from "./templates/ClassicTemplate";
import ShippingTemplate from "./templates/ShippingTemplate";

const templates = {
  classic: ClassicTemplate,
  shipping: ShippingTemplate
};

export default function InvoicePreview(props) {
  const Template = templates[props.invoiceData.template] || ClassicTemplate;
  return <Template {...props} />;
}
