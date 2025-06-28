using Microsoft.Playwright;

public class ImageExportService
{
    public async Task<byte[]> ExportNoteToImageAsync(string title, List<string> tags, string contentHtml)
    {
        var tagsHtml = string.Join("", tags.Select(t => $"<span class='tag'>{t}</span>"));

        var html = $@"
            <html>
            <head>
                <meta charset='UTF-8'>
                <style>
                    body {{
                        font-family: 'Segoe UI', sans-serif;
                        padding: 40px;
                        background: white;
                        color: #333;
                        width: 800px;
                    }}
                    h1 {{
                        font-size: 24px;
                        color: #2c3e50;
                        margin-bottom: 10px;
                    }}
                    .tags {{
                        margin-bottom: 20px;
                    }}
                    .tag {{
                        display: inline-block;
                        background-color: #e0e0e0;
                        color: #555;
                        padding: 4px 8px;
                        margin: 0 4px 4px 0;
                        border-radius: 5px;
                        font-size: 12px;
                    }}
                    .content {{
                        font-size: 16px;
                        line-height: 1.6;
                    }}
                    img {{
                        max-width: 100%;
                        height: auto;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        margin: 10px 0;
                    }}
                </style>
            </head>
            <body>
                <h1>{title}</h1>
                <div class='tags'>{tagsHtml}</div>
                <div class='content'>{contentHtml}</div>
            </body>
            </html>";

        using var playwright = await Playwright.CreateAsync();
        await using var browser = await playwright.Chromium.LaunchAsync(new() { Headless = true });

        var page = await browser.NewPageAsync(new()
        {
            ViewportSize = new() { Width = 900, Height = 1200 }
        });

        await page.SetContentAsync(html, new() { WaitUntil = WaitUntilState.NetworkIdle });
        await page.EvaluateAsync("document.body.style.margin='0';");

        var elementHandle = await page.QuerySelectorAsync("body");

        if (elementHandle == null)
        {
            throw new InvalidOperationException("Could not find the body element to take a screenshot.");
        }

        return await elementHandle.ScreenshotAsync(new ElementHandleScreenshotOptions
        {
            Type = ScreenshotType.Png
        });
    }
}
