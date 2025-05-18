import { SiGooglesheets, SiFacebook, SiHubspot, SiSlack } from "react-icons/si";
import { Layers } from "lucide-react";
import { GoogleSheetsConnector } from "@/components/integration/GoogleSheetsConnector";
import { ConnectionManager } from "@/components/integration/ConnectionManager";

export const SERVICE_REGISTRY: Record<
  string,
  {
    icon: any;
    connector: any;
    requiredFields: string[];
  }
> = {
  "google-sheets": {
    icon: SiGooglesheets,
    connector: GoogleSheetsConnector,
    requiredFields: ["spreadsheet_id", "sheet_name"],
  },
  facebook: {
    icon: SiFacebook,
    connector: ConnectionManager,
    requiredFields: ["facebook_credential_id"],
  },
  hubspot: {
    icon: SiHubspot,
    connector: ConnectionManager,
    requiredFields: ["hubspot_credential_id"],
  },
  slack: {
    icon: SiSlack,
    connector: ConnectionManager,
    requiredFields: ["slack_credential_id"],
  },
  pipedrive: {
    icon: Layers,
    connector: ConnectionManager,
    requiredFields: ["pipedrive_credential_id"],
  },
  "anthropic-claude": {
    icon: Layers, // Replace with an appropriate icon for Anthropic Claude
    connector: ConnectionManager, // Replace with a specific connector if available
    requiredFields: ["api_key", "prompt", "sheet_id"],
  },
  // Add more services as needed
};
