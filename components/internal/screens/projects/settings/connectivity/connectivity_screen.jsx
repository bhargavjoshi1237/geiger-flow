"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  RefreshCw,
  Check,
  AlertCircle,
  Settings,
  Unlink,
} from "lucide-react";

const GitHubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const AWSIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.2l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 0 1-.303.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.416-.287-.807-.414l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 0 1-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167zM21.698 16.207c-2.626 1.94-6.442 2.969-9.722 2.969-4.598 0-8.74-1.7-11.87-4.526-.247-.223-.024-.527.27-.351 3.384 1.963 7.559 3.153 11.877 3.153 2.914 0 6.114-.607 9.06-1.852.439-.2.814.287.385.607zM22.792 14.961c-.336-.43-2.22-.207-3.074-.103-.255.032-.295-.192-.063-.36 1.5-1.053 3.967-.75 4.254-.399.287.36-.08 2.826-1.485 4.007-.215.184-.423.088-.327-.151.32-.79 1.03-2.57.695-2.994z"/>
  </svg>
);

const VercelIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 22.525H0l12-21.05 12 21.05z"/>
  </svg>
);

const SupabaseIcon = ({ className }) => (
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 128 128"><defs><linearGradient id="SVG7pxEXcwp" x1="53.974" x2="94.163" y1="54.974" y2="71.829" gradientTransform="translate(29.387 60.096)scale(1.1436)" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#249361"/><stop offset="1" stopColor="#3ecf8e"/></linearGradient><linearGradient id="SVGwe4qUjnW" x1="36.156" x2="54.484" y1="30.578" y2="65.081" gradientTransform="translate(29.387 60.096)scale(1.1436)" gradientUnits="userSpaceOnUse"><stop offset="0"/><stop offset="1" stopOpacity="0"/></linearGradient></defs><path fill="url(#SVG7pxEXcwp)" d="M102.24 186.21c-3.267 4.117-9.904 1.862-9.977-3.397l-1.156-76.906h51.715c9.365 0 14.587 10.817 8.763 18.149z" transform="translate(-27.722 -60.338)"/><path fill="url(#SVGwe4qUjnW)" fillOpacity=".2" d="M102.24 186.21c-3.267 4.117-9.904 1.862-9.977-3.397l-1.156-76.906h51.715c9.365 0 14.587 10.817 8.763 18.149z" transform="translate(-27.722 -60.338)"/><path fill="#3ecf8e" d="M53.484 2.128c3.267-4.117 9.905-1.862 9.977 3.396l.508 76.907H12.902c-9.365 0-14.587-10.817-8.764-18.149z"/></svg>
);

const AzureIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#ffffff" d="M13.05 4.24L6.56 18.05L2 18l5.09-8.76zm.7 1.09L22 19.76H6.74l9.3-1.66l-4.87-5.79z"/></svg>
);

const GCPIcon = ({ className }) => (
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 128 128"><path fill="#ea4535" d="M80.6 40.3h.4l-.2-.2l14-14v-.3c-11.8-10.4-28.1-14-43.2-9.5S24.9 32.8 20.7 48c.2-.1.5-.2.8-.2c5.2-3.4 11.4-5.4 17.9-5.4c2.2 0 4.3.2 6.4.6c.1-.1.2-.1.3-.1c9-9.9 24.2-11.1 34.6-2.6z"/><path fill="#557ebf" d="M108.1 47.8c-2.3-8.5-7.1-16.2-13.8-22.1L80 39.9c6 4.9 9.5 12.3 9.3 20v2.5c16.9 0 16.9 25.2 0 25.2H63.9v20h-.1l.1.2h25.4c14.6.1 27.5-9.3 31.8-23.1s-1-28.8-13-36.9"/><path fill="#36a852" d="M39 107.9h26.3V87.7H39c-1.9 0-3.7-.4-5.4-1.1l-15.2 14.6v.2c6 4.3 13.2 6.6 20.7 6.6z"/><path fill="#f9bc15" d="M40.2 41.9c-14.9.1-28.1 9.3-32.9 22.8c-4.8 13.6 0 28.5 11.8 37.3l15.6-14.9c-8.6-3.7-10.6-14.5-4-20.8c6.6-6.4 17.8-4.4 21.7 3.8L68 55.2C61.4 46.9 51.1 42 40.2 42.1z"/></svg>
);

const integrations = [
  {
    id: "github",
    name: "GitHub",
    description: "Connect your GitHub repositories for seamless code integration and deployment.",
    icon: GitHubIcon,
    category: "Version Control",
    features: ["Repository access", "Webhooks", "CI/CD integration"],
    docsUrl: "https://docs.github.com",
  },
  {
    id: "aws",
    name: "AWS",
    description: "Connect Amazon Web Services for cloud infrastructure and serverless deployments.",
    icon: AWSIcon,
    category: "Cloud Provider",
    features: ["S3 buckets", "Lambda functions", "EC2 instances"],
    docsUrl: "https://aws.amazon.com/docs",
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Deploy your projects with zero configuration using Vercel.",
    icon: VercelIcon,
    category: "Deployment",
    features: ["Auto deployments", "Edge functions", "Analytics"],
    docsUrl: "https://vercel.com/docs",
  },
  {
    id: "supabase",
    name: "Supabase",
    description: "Connect Supabase for authentication, database, and real-time subscriptions.",
    icon: SupabaseIcon,
    category: "Backend Services",
    features: ["PostgreSQL", "Authentication", "Real-time"],
    docsUrl: "https://supabase.com/docs",
  },
  {
    id: "azure",
    name: "Azure",
    description: "Connect Microsoft Azure for enterprise cloud services and deployments.",
    icon: AzureIcon,
    category: "Cloud Provider",
    features: ["App Services", "Functions", "Storage accounts"],
    docsUrl: "https://azure.microsoft.com/docs",
  },
  {
    id: "gcp",
    name: "Google Cloud",
    description: "Connect Google Cloud Platform for scalable infrastructure and AI services.",
    icon: GCPIcon,
    category: "Cloud Provider",
    features: ["Cloud Run", "BigQuery", "Cloud Functions"],
    docsUrl: "https://cloud.google.com/docs",
  },
];

function IntegrationCard({ integration, connectionStatus, onConnect, onDisconnect, onManage }) {
  const Icon = integration.icon;
  const isConnected = connectionStatus === "connected";
  const isPending = connectionStatus === "pending";
  const hasError = connectionStatus === "error";

  return (
    <div className="bg-[#202020] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#474747] transition-all duration-300 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center shadow-inner group-hover:border-[#333333] transition-colors">
            <Icon className="w-5 h-5 text-[#e7e7e7]" />
          </div>
          <div>
            <h3 className="text-[#e7e7e7] font-semibold text-base">
              {integration.name}
            </h3>
            <span className="text-[#525252] text-xs font-medium">
              {integration.category}
            </span>
          </div>
        </div>
        <a
          href={integration.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#525252] hover:text-[#a3a3a3] transition-colors p-1"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <p className="text-[#a3a3a3] text-sm leading-relaxed mb-4 flex-1">
        {integration.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {integration.features.map((feature, index) => (
          <span
            key={index}
            className="text-[10px] font-medium text-[#737373] bg-[#1a1a1a] px-2 py-1 rounded border border-[#2a2a2a]"
          >
            {feature}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          {isConnected && (
            <>
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px] font-bold tracking-wide uppercase">
                Connected
              </Badge>
            </>
          )}
          {isPending && (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
              <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[10px] font-bold tracking-wide uppercase">
                Pending
              </Badge>
            </>
          )}
          {hasError && (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] font-bold tracking-wide uppercase">
                Error
              </Badge>
            </>
          )}
          {!isConnected && !isPending && !hasError && (
            <Badge className="bg-transparent text-[#525252] border-[#2a2a2a] text-[10px] font-bold tracking-wide uppercase">
              Not Connected
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isConnected && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onManage(integration.id)}
                className="h-8 px-3 text-xs text-[#a3a3a3] hover:text-[#e7e7e7] hover:bg-[#2a2a2a]"
              >
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                Manage
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDisconnect(integration.id)}
                className="h-8 px-3 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Unlink className="w-3.5 h-3.5 mr-1.5" />
                Disconnect
              </Button>
            </>
          )}
          {!isConnected && !isPending && !hasError && (
            <Button
              size="sm"
              onClick={() => onConnect(integration.id)}
              className="h-8 px-4 text-xs font-medium bg-[#2a2a2a] hover:bg-[#333333] text-[#e7e7e7] border border-[#333333]"
            >
              Connect
            </Button>
          )}
          {(isPending || hasError) && (
            <Button
              size="sm"
              onClick={() => onConnect(integration.id)}
              className="h-8 px-4 text-xs font-medium bg-[#2a2a2a] hover:bg-[#333333] text-[#e7e7e7] border border-[#333333]"
            >
              {hasError ? "Retry" : "Continue"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ConnectivityScreen() {
  const [connections, setConnections] = useState({
    github: "connected",
    vercel: "connected",
    supabase: "pending",
    aws: null,
    azure: null,
    gcp: "error",
  });

  const handleConnect = (integrationId) => {
    console.log(`Connecting to ${integrationId}...`);
    setConnections((prev) => ({
      ...prev,
      [integrationId]: "pending",
    }));
    
    setTimeout(() => {
      setConnections((prev) => ({
        ...prev,
        [integrationId]: "connected",
      }));
    }, 2000);
  };

  const handleDisconnect = (integrationId) => {
    console.log(`Disconnecting from ${integrationId}...`);
    setConnections((prev) => ({
      ...prev,
      [integrationId]: null,
    }));
  };

  const handleManage = (integrationId) => {
    console.log(`Managing ${integrationId}...`);
  };

  const connectedCount = Object.values(connections).filter(
    (status) => status === "connected"
  ).length;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Integrations</CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Connect your project with external services for enhanced
                  functionality.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-[#2a2a2a]">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-sm text-[#a3a3a3]">
                  <span className="text-[#e7e7e7] font-medium">
                    {connectedCount}
                  </span>{" "}
                  of {integrations.length} connected
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              connectionStatus={connections[integration.id]}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onManage={handleManage}
            />
          ))}
        </div>
      </div>

      <Card className="bg-[#161616] border-[#2a2a2a]">
        <CardContent className="">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 mt-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-[#a3a3a3]" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-medium text-[#e7e7e7]">
                Need help with integrations?
              </h4>
              <p className="text-sm text-[#737373]">
                Check our documentation for detailed guides on connecting each
                service, or contact support if you encounter any issues.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className=" mt-4 shrink-0 bg-[#202020] border-[#2a2a2a] text-[#a3a3a3] hover:text-[#e7e7e7] hover:bg-[#2a2a2a]"
            >
              View Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
