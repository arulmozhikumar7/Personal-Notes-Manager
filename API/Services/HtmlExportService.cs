using System.Text;

public class HtmlExportService
{
    public Task<byte[]> ExportNoteToHtmlAsync(string title, List<string> tags, string contentHtml)
    {
        var tagsHtml = string.Join("", tags.Select(t => $"<span class='tag'>{t}</span>"));

        var html = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>{title}</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            padding: 40px;
            background: white;
            color: #333;
        }}
        h1 {{
            font-size: 24px;
            color: #2c3e50;
        }}
        .tags {{
            margin: 10px 0;
        }}
        .tag {{
            display: inline-block;
            background-color: #eee;
            padding: 4px 8px;
            margin-right: 6px;
            border-radius: 5px;
            font-size: 12px;
        }}
        .content {{
            margin-top: 20px;
            font-size: 16px;
            line-height: 1.6;
        }}
        img {{
            max-width: 100%;
            height: auto;
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

        return Task.FromResult(Encoding.UTF8.GetBytes(html));
    }
}
