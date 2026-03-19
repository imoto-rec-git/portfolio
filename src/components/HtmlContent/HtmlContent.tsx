import React from "react";
import styles from "./HtmlContent.module.scss";
import DOMPurify from "isomorphic-dompurify";

const HtmlContent: React.FC<{ html: string }> = ({ html }) => (
  <div className={styles.text} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
);

export default HtmlContent;
