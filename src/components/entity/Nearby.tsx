import { useEffect, useState } from "react";
import type { Coordinate } from "@yext/types";
import { FALLBACK_SEARCH_PATH } from "src/config";
import { GoogleMaps, Link, LocationMap } from "@yext/pages-components";
import { useTemplateData } from "src/common/useTemplateData";
import type { LiveAPIProfile, LocationProfile } from "src/types/entities";
import classNames from "classnames";
import DirectoryCard from "src/components/cards/DirectoryCard";
import { getMapKey } from "src/common/getMapKey";

// Configure nearby locations section liveapi params and endpoint
// For all available params see: https://hitchhikers.yext.com/docs/contentdeliveryapis/legacy/entities#operation/geoSearchEntities

const getConfig = (api_key: string) => {
  return {
    endpoint: "https://liveapi.yext.com/v2/accounts/me/entities/geosearch",
    params: {
      api_key,
      entityTypes: "location",
      limit: "4",
      radius: "50",
      savedFilterIds: YEXT_PUBLIC_NEARBY_SAVEDFILTER_ID,
      v: "20220927",
    },
  };
};

type NearbyProps = {
  title?: string;
  linkToLocator?: boolean;
  buttonText?: string;
  buttonLink?: string;
  coordinate: Coordinate;
  id: string;
};

const Nearby = (props: NearbyProps) => {
  const {
    title = "Nearby Locations",
    linkToLocator = true,
    buttonText = "Find a Location",
    buttonLink,
    coordinate,
    id,
  } = props;
  const mappinSVG = (
    <svg
      width="56"
      height="58"
      viewBox="0 0 56 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M28.0951 1C33.1149 1 37.6595 3.03469 40.9491 6.32432C44.2388 9.61396 46.2734 14.1586 46.2734 19.1784C46.2734 25.9554 40.1704 38.558 28.0941 57C16.019 38.5565 9.91669 25.955 9.91669 19.1784C9.91669 14.1586 11.9514 9.61396 15.241 6.32432C18.5307 3.03469 23.0752 1 28.0951 1Z"
        fill="#0F70F0"
        stroke="black"
        strokeOpacity="0.5"
      />
      <path
        d="M28.095 27.2577C32.5571 27.2577 36.1743 23.6405 36.1743 19.1784C36.1743 14.7163 32.5571 11.0991 28.095 11.0991C23.633 11.0991 20.0157 14.7163 20.0157 19.1784C20.0157 23.6405 23.633 27.2577 28.095 27.2577Z"
        fill="white"
      />
    </svg>
  );
  const mapKey = getMapKey();
  console.log("mapKey", mapKey);
  const { document, relativePrefixToRoot } = useTemplateData();
  const search_path =
    document?._site?.c_searchPage?.slug || FALLBACK_SEARCH_PATH;
  const apiKey = YEXT_PUBLIC_NEARBY_API_KEY;
  const [nearbyLocations, setNearbyLocations] = useState<
    LiveAPIProfile<LocationProfile>[]
  >([]);

  useEffect(() => {
    if (!coordinate || !apiKey) {
      return;
    }

    const config = getConfig(apiKey);
    const searchParams = new URLSearchParams({
      ...config.params,
      location: `${coordinate.latitude},${coordinate.longitude}`,
      filter: JSON.stringify({ "meta.id": { "!$eq": `${id}` } }),
    });

    fetch(`${config.endpoint}?${searchParams.toString()}`)
      .then((resp) => resp.json())
      .then((data) => setNearbyLocations(data.response.entities || []))
      .catch((error) => console.error(error));
  }, [coordinate, id, apiKey]);

  const renderLocatorLink = (cls?: string) => {
    return linkToLocator ? (
      <Link
        href={buttonLink ?? relativePrefixToRoot + search_path}
        className={classNames("Button Button--primary mt-8 sm:mt-0", cls)}
      >
        {buttonText}
      </Link>
    ) : null;
  };

  if (!apiKey) {
    console.error(
      "Add the nearby API key to the Site Entity to enable nearby functionality."
    );
  }

  return (
    <div className="py-8 sm:py-16">
      <div className="container">
        <div className="flex justify-between items-center mb-8">
          <h2 className="Heading Heading--head">{title}</h2>
          {renderLocatorLink("hidden sm:flex")}
        </div>
        <ul className="flex flex-wrap -m-4">
          {nearbyLocations.map((location) => {
            return (
              <li
                key={location.meta.id}
                className="p-4 w-full sm:w-1/2 lg:w-1/2 flex flex-raw"
              >
                <img
                  className="sm:w-1/4 w-full"
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${location.address.city},${location.address.line1},${location.address.postalCode}&zoom=13&size=600x300&maptype=roadmap
&markers=color:blue%7Clabel:PAPAJOHNS%7C${location.yextDisplayCoordinate.latitude},${location.yextDisplayCoordinate.longitude}
&key=${YEXT_PUBLIC_MAPS_API_KEY}`}
                ></img>
                <DirectoryCard profile={location} />
              </li>
            );
          })}
        </ul>
        {renderLocatorLink("sm:hidden")}
      </div>
    </div>
  );
};

export default Nearby;
