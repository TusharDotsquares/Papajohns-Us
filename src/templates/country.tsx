export { getPath } from "src/layouts/country/getPath";
export { transformProps } from "src/layouts/country/transformProps";
export { getHeadConfig } from "src/layouts/country/getHeadConfig";
import { Template } from "@yext/pages";
import CountryLayout from "src/layouts/country/template";
import { configBuilder } from "src/layouts/country/configBuilder";
import { DirectoryProfile, TemplateRenderProps } from "src/types/entities";

// When copying this file for multibrand, you can pass arguments
// to customize the stream id or filter
export const config = configBuilder();

const Country: Template<TemplateRenderProps<DirectoryProfile<never>>> = (
  data
) => <CountryLayout {...data} />;

export default Country;
