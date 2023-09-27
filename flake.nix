{
  inputs = {
    # nixpkgs.url = "github:NixOS/nixpkgs/nixos-23.05";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-23.05";
    systems.url = "github:nix-systems/default";
    devenv.url = "github:cachix/devenv";
  };

  nixConfig = {
    extra-trusted-public-keys = "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw=";
    extra-substituters = "https://devenv.cachix.org";
  };

  outputs = { self, nixpkgs, devenv, systems, ... } @ inputs:
    let
      forEachSystem = nixpkgs.lib.genAttrs (import systems);
    in
    {
      devShells = forEachSystem
        (system:
          let
            pkgs = nixpkgs.legacyPackages.${system};
          in
          {
            default = devenv.lib.mkShell {
              inherit inputs pkgs;
              modules = [
                {
                  # https://devenv.sh/reference/options/
                  packages = with pkgs;[
                  prisma-engines
                  openssl
                  sqlite
                  nodePackages_latest.ts-node
                  ];
                  dotenv.disableHint = true;
                  languages.javascript.enable = true;
                  languages.javascript.package = pkgs.nodejs_20;
                  languages.typescript.enable = true;
                  services.mysql.enable=true;
                  # enterShell = ''
                  #   hello
                  # '';

                  env.PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/migration-engine";
                  # env.PRISMA_MIGRATION_ENGINE_BINARY="${pkgs.prisma-engines}/bin/migration-engine";
                  env.PRISMA_QUERY_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/query-engine";
                  env.PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine.node";
                  env.PRISMA_FMT_BINARY = "${pkgs.prisma-engines}/bin/prisma-fmt";
                }
              ];
            };
          });
    };
}
