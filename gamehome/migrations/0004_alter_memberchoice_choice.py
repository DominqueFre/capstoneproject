from django.db import migrations, models


def set_legacy_choices_to_random(apps, schema_editor):
    MemberChoice = apps.get_model("gamehome", "MemberChoice")
    MemberChoice.objects.filter(choice__in=["X", "O"]).update(
        choice="Random",
        piece_identifier=None,
    )


class Migration(migrations.Migration):

    dependencies = [
        ("gamehome", "0003_alter_memberchoice_choice"),
    ]

    operations = [
        migrations.AlterField(
            model_name="memberchoice",
            name="choice",
            field=models.CharField(
                choices=[
                    ("Random", "Random"),
                    ("Selection", "Selected from gallery"),
                ],
                default="Random",
                max_length=20,
            ),
        ),
        migrations.RunPython(
            set_legacy_choices_to_random,
            migrations.RunPython.noop,
        ),
    ]