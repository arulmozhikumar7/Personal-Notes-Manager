using Microsoft.Playwright;
public class PdfExportService
{
    public async Task<byte[]> ExportNoteToPdfAsync(string title, List<string> tags, string contentHtml)
    {
        var tagsHtml = string.Join("", tags.Select(t => $"<span class='tag'>{t}</span>"));

        var html = $@"
            <html>
            <head>
                <meta charset='UTF-8'>
                <style>
                    body {{
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 40px;
                        background: #fff;
                        color: #333;
                    }}
                    h1 {{
                        font-size: 24px;
                        margin-bottom: 10px;
                        color: #2c3e50;
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
                        margin: 10px 0;
                        border: 1px solid #ccc;
                        border-radius: 4px;
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
        await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions { Headless = true });
        var page = await browser.NewPageAsync();
        await page.SetContentAsync(html, new PageSetContentOptions { WaitUntil = WaitUntilState.NetworkIdle });

        return await page.PdfAsync(new PagePdfOptions
        {
            Format = "A4",
            PrintBackground = true,
            Margin = new() { Top = "30px", Bottom = "30px", Left = "30px", Right = "30px" }
        });
    }
}
