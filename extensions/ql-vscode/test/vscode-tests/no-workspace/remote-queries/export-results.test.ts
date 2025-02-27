import { join } from "path";
import { readFile } from "fs-extra";
import { Credentials } from "../../../../src/authentication";
import * as markdownGenerator from "../../../../src/remote-queries/remote-queries-markdown-generation";
import * as ghApiClient from "../../../../src/remote-queries/gh-api/gh-api-client";
import { exportRemoteQueryAnalysisResults } from "../../../../src/remote-queries/export-results";

describe("export results", () => {
  describe("exportRemoteQueryAnalysisResults", () => {
    const mockCredentials = {} as unknown as Credentials;

    beforeEach(() => {
      jest.spyOn(markdownGenerator, "generateMarkdown").mockReturnValue([]);
      jest.spyOn(Credentials, "initialize").mockResolvedValue(mockCredentials);
    });

    it("should call the GitHub Actions API with the correct gist title", async function () {
      const mockCreateGist = jest
        .spyOn(ghApiClient, "createGist")
        .mockResolvedValue(undefined);

      const query = JSON.parse(
        await readFile(
          join(
            __dirname,
            "../data/remote-queries/query-with-results/query.json",
          ),
          "utf8",
        ),
      );
      const analysesResults = JSON.parse(
        await readFile(
          join(
            __dirname,
            "../data/remote-queries/query-with-results/analyses-results.json",
          ),
          "utf8",
        ),
      );

      await exportRemoteQueryAnalysisResults(
        "",
        query,
        analysesResults,
        "gist",
      );

      expect(mockCreateGist).toHaveBeenCalledTimes(1);
      expect(mockCreateGist).toHaveBeenCalledWith(
        expect.anything(),
        "Shell command built from environment values (javascript) 3 results (10 repositories)",
        expect.anything(),
      );
    });
  });
});
