Add-Type -AssemblyName System.Drawing

$renderSource = @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

public static class NityamIconRenderer
{
    private static readonly Color Obsidian = Color.FromArgb(255, 9, 11, 14);
    private static readonly Color Silver = Color.FromArgb(255, 174, 182, 185);
    private static readonly Color Gold = Color.FromArgb(255, 199, 163, 90);

    public static void Render(string path, int size, bool transparent, bool monochrome)
    {
        using (Bitmap bitmap = new Bitmap(size, size, PixelFormat.Format32bppArgb))
        using (Graphics graphics = Graphics.FromImage(bitmap))
        {
            graphics.SmoothingMode = SmoothingMode.AntiAlias;
            graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
            graphics.CompositingQuality = CompositingQuality.HighQuality;
            graphics.Clear(transparent ? Color.Transparent : Obsidian);
            graphics.ScaleTransform(size / 1024f, size / 1024f);

            if (transparent)
            {
                graphics.TranslateTransform(512, 512);
                graphics.ScaleTransform(0.95f, 0.95f);
                graphics.TranslateTransform(-512, -512);
            }

            if (!transparent && !monochrome)
                DrawBackground(graphics);

            DrawMala(graphics, monochrome);
            bitmap.Save(path, ImageFormat.Png);
        }
    }

    private static void DrawBackground(Graphics g)
    {
        using (GraphicsPath path = new GraphicsPath())
        {
            path.AddEllipse(36, 36, 952, 952);
            using (PathGradientBrush glow = new PathGradientBrush(path))
            {
                glow.CenterPoint = new PointF(512, 480);
                glow.CenterColor = Color.FromArgb(255, 25, 28, 32);
                glow.SurroundColors = new[] { Obsidian };
                g.FillEllipse(glow, 36, 36, 952, 952);
            }
        }
    }

    private static void DrawMala(Graphics g, bool monochrome)
    {
        Color silver = monochrome ? Color.White : Silver;
        Color strand = monochrome ? Color.FromArgb(150, 255, 255, 255) : Color.FromArgb(145, 150, 159, 163);

        using (Pen outerHalo = new Pen(monochrome ? Color.FromArgb(65, 255, 255, 255) : Color.FromArgb(50, 198, 205, 207), 1.4f))
            g.DrawEllipse(outerHalo, 207, 175, 610, 610);

        using (Pen loop = new Pen(strand, 2.4f))
            g.DrawEllipse(loop, 230, 198, 564, 564);

        const int beadCount = 48;
        const float centerX = 512;
        const float centerY = 480;
        const float loopRadius = 282;
        const float beadRadius = 10.3f;

        for (int i = 0; i < beadCount; i++)
        {
            double angle = (-90.0 + i * 360.0 / beadCount) * Math.PI / 180.0;
            double normalized = (angle * 180.0 / Math.PI + 360.0) % 360.0;
            if (normalized > 77 && normalized < 103) continue;

            float x = centerX + (float)Math.Cos(angle) * loopRadius;
            float y = centerY + (float)Math.Sin(angle) * loopRadius;
            RectangleF bead = new RectangleF(x - beadRadius, y - beadRadius, beadRadius * 2, beadRadius * 2);

            using (SolidBrush shadow = new SolidBrush(Color.FromArgb(95, 0, 0, 0)))
                g.FillEllipse(shadow, bead.X + 1.3f, bead.Y + 2.1f, bead.Width, bead.Height);

            if (monochrome)
            {
                using (SolidBrush fill = new SolidBrush(Color.White)) g.FillEllipse(fill, bead);
            }
            else
            {
                using (LinearGradientBrush fill = new LinearGradientBrush(bead, Color.FromArgb(255, 194, 201, 203), Color.FromArgb(255, 143, 151, 154), LinearGradientMode.Vertical))
                    g.FillEllipse(fill, bead);
            }
        }

        using (Pen connector = new Pen(monochrome ? Color.White : Color.FromArgb(210, 166, 173, 176), 5.2f))
        {
            connector.StartCap = LineCap.Round;
            connector.EndCap = LineCap.Round;
            g.DrawLine(connector, 512, 758, 512, 780);
        }

        if (monochrome)
        {
            using (SolidBrush knot = new SolidBrush(Color.White)) g.FillEllipse(knot, 505, 768, 14, 14);
            using (SolidBrush guru = new SolidBrush(Color.White)) g.FillEllipse(guru, 475, 782, 74, 74);
            using (Pen outline = new Pen(Color.White, 2.4f)) g.DrawEllipse(outline, 475, 782, 74, 74);
        }
        else
        {
            using (SolidBrush knot = new SolidBrush(Color.FromArgb(255, 172, 179, 181))) g.FillEllipse(knot, 505, 768, 14, 14);
            using (SolidBrush shadow = new SolidBrush(Color.FromArgb(100, 0, 0, 0))) g.FillEllipse(shadow, 477, 789, 74, 74);
            using (LinearGradientBrush guru = new LinearGradientBrush(new RectangleF(474, 780, 76, 76), Color.FromArgb(255, 215, 188, 122), Gold, LinearGradientMode.ForwardDiagonal))
                g.FillEllipse(guru, 474, 780, 76, 76);
            using (Pen outline = new Pen(Color.FromArgb(255, 239, 204, 121), 2.5f)) g.DrawEllipse(outline, 474, 780, 76, 76);
        }
    }
}
'@

Add-Type -TypeDefinition $renderSource -ReferencedAssemblies System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$assetDir = Join-Path $projectRoot 'assets'
$publicDir = Join-Path $projectRoot 'public'

[NityamIconRenderer]::Render((Join-Path $assetDir 'icon.png'), 1024, $false, $false)
[NityamIconRenderer]::Render((Join-Path $assetDir 'favicon.png'), 64, $false, $false)
[NityamIconRenderer]::Render((Join-Path $assetDir 'android-icon-background.png'), 1024, $false, $false)
[NityamIconRenderer]::Render((Join-Path $assetDir 'android-icon-foreground.png'), 1024, $true, $false)
[NityamIconRenderer]::Render((Join-Path $assetDir 'android-icon-monochrome.png'), 1024, $true, $true)
[NityamIconRenderer]::Render((Join-Path $assetDir 'splash-icon.png'), 512, $true, $false)
[NityamIconRenderer]::Render((Join-Path $publicDir 'icon-192.png'), 192, $false, $false)
[NityamIconRenderer]::Render((Join-Path $publicDir 'icon-512.png'), 512, $false, $false)
[NityamIconRenderer]::Render((Join-Path $publicDir 'apple-touch-icon.png'), 180, $false, $false)

$svg = [System.Text.StringBuilder]::new()
[void]$svg.AppendLine('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">')
[void]$svg.AppendLine('  <defs><radialGradient id="bg" cx="50%" cy="47%" r="68%"><stop offset="0" stop-color="#191c20"/><stop offset="1" stop-color="#090b0e"/></radialGradient><linearGradient id="silver" x2="0" y2="1"><stop stop-color="#c2c9cb"/><stop offset="1" stop-color="#8f979a"/></linearGradient><linearGradient id="gold" x2="1" y2="1"><stop stop-color="#d7bc7a"/><stop offset="1" stop-color="#c7a35a"/></linearGradient></defs>')
[void]$svg.AppendLine('  <rect width="1024" height="1024" fill="url(#bg)"/>')
[void]$svg.AppendLine('  <circle cx="512" cy="480" r="305" fill="none" stroke="#c6cdcf" stroke-opacity=".2" stroke-width="1.4"/>')
[void]$svg.AppendLine('  <circle cx="512" cy="480" r="282" fill="none" stroke="#969fa3" stroke-opacity=".57" stroke-width="2.4"/>')
for ($i = 0; $i -lt 48; $i++) {
    $angle = (-90.0 + $i * 360.0 / 48) * [Math]::PI / 180.0
    $normalized = ((-90.0 + $i * 360.0 / 48) + 360.0) % 360.0
    if ($normalized -gt 77 -and $normalized -lt 103) { continue }
    $x = [Math]::Round(512 + [Math]::Cos($angle) * 282, 2)
    $y = [Math]::Round(480 + [Math]::Sin($angle) * 282, 2)
    [void]$svg.AppendLine(('  <circle cx="{0}" cy="{1}" r="10.3" fill="url(#silver)"/>' -f $x, $y))
}
[void]$svg.AppendLine('  <path d="M512 758v22" stroke="#a6adaf" stroke-width="5.2" stroke-linecap="round"/><circle cx="512" cy="775" r="7" fill="#acb3b5"/>')
[void]$svg.AppendLine('  <circle cx="512" cy="818" r="38" fill="url(#gold)" stroke="#efcc79" stroke-width="2.5"/>')
[void]$svg.AppendLine('</svg>')
$svg.ToString().TrimEnd() | Set-Content -LiteralPath (Join-Path $assetDir 'nityam-icon.svg') -Encoding utf8
