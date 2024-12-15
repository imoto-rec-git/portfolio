import React from "react";
import styles from "./HtmlContent.module.scss";

const HtmlContent: React.FC<{ html: string }> = ({ html }) => (
  <div className={styles.text} dangerouslySetInnerHTML={{ __html: html }} />
);

export default HtmlContent;
