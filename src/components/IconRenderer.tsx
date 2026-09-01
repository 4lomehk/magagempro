import React from 'react';
import {
  Sparkles,
  ListChecks,
  Coffee,
  Sun,
  Activity,
  Shield,
  ShieldCheck,
  Zap,
  Flame,
  Droplet,
  Fish,
  RefreshCw,
  Lock,
  Unlock,
  ExternalLink,
  Key,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Download,
  Upload,
  Globe,
  RotateCcw,
  Sparkle,
  ArrowRight,
  ChevronRight,
  Sliders,
  Check,
  X,
  Apple,
  Heart,
  Brain,
  Pill,
  Leaf,
  BatteryCharging,
  Dna,
  Target,
  Award,
  Database,
  Eye,
  Smile,
  Compass,
  Crosshair,
  Stethoscope,
  Gauge,
  Fuel,
  Layers,
  Bot,
  Code,
  Copy,
  BookOpen,
  HelpCircle
} from 'lucide-react';

interface IconRendererProps {
  name?: string;
  className?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name = 'Sparkles', className = 'w-4 h-4' }) => {
  switch (name) {
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Apple':
      return <Apple className={className} />;
    case 'Heart':
      return <Heart className={className} />;
    case 'Brain':
      return <Brain className={className} />;
    case 'Pill':
      return <Pill className={className} />;
    case 'Leaf':
      return <Leaf className={className} />;
    case 'BatteryCharging':
      return <BatteryCharging className={className} />;
    case 'Dna':
      return <Dna className={className} />;
    case 'Target':
      return <Target className={className} />;
    case 'Award':
      return <Award className={className} />;
    case 'Database':
      return <Database className={className} />;
    case 'Eye':
      return <Eye className={className} />;
    case 'Smile':
      return <Smile className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'Crosshair':
      return <Crosshair className={className} />;
    case 'Stethoscope':
      return <Stethoscope className={className} />;
    case 'Gauge':
      return <Gauge className={className} />;
    case 'Fuel':
      return <Fuel className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'HelpCircle':
      return <HelpCircle className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    case 'Bot':
      return <Bot className={className} />;
    case 'Code':
      return <Code className={className} />;
    case 'Copy':
      return <Copy className={className} />;
    case 'ListChecks':
      return <ListChecks className={className} />;
    case 'Coffee':
      return <Coffee className={className} />;
    case 'Sun':
      return <Sun className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'Shield':
      return <Shield className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'Droplet':
      return <Droplet className={className} />;
    case 'Fish':
      return <Fish className={className} />;
    case 'RefreshCw':
      return <RefreshCw className={className} />;
    case 'Lock':
      return <Lock className={className} />;
    case 'Unlock':
      return <Unlock className={className} />;
    case 'ExternalLink':
      return <ExternalLink className={className} />;
    case 'Key':
      return <Key className={className} />;
    case 'CheckCircle2':
      return <CheckCircle2 className={className} />;
    case 'AlertTriangle':
      return <AlertTriangle className={className} />;
    case 'Settings':
      return <Settings className={className} />;
    case 'Plus':
      return <Plus className={className} />;
    case 'Trash2':
      return <Trash2 className={className} />;
    case 'Edit3':
      return <Edit3 className={className} />;
    case 'Download':
      return <Download className={className} />;
    case 'Upload':
      return <Upload className={className} />;
    case 'Globe':
      return <Globe className={className} />;
    case 'RotateCcw':
      return <RotateCcw className={className} />;
    case 'Sparkle':
      return <Sparkle className={className} />;
    case 'ArrowRight':
      return <ArrowRight className={className} />;
    case 'ChevronRight':
      return <ChevronRight className={className} />;
    case 'Sliders':
      return <Sliders className={className} />;
    case 'Check':
      return <Check className={className} />;
    case 'X':
      return <X className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};
